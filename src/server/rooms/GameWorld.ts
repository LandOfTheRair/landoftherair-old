
import { omitBy, startsWith, isString, isObject, cloneDeep, sample, find, compact, get, filter, clone, pull } from 'lodash';

import * as scheduler from 'node-schedule';

import { Parser } from 'mingy';

import { LootRoller, LootFunctions, LootTable } from 'lootastic';
import { species } from 'fantastical';

import { Room } from 'colyseus';
import { GameState } from '../../shared/models/gamestate';
import { MapLayer } from '../../shared/models/maplayer';

import { DB } from '../database';
import { Player } from '../../shared/models/player';

import { CommandExecutor } from '../helpers/command-executor';
import { NPC } from '../../shared/models/npc';
import { Logger } from '../logger';
import { Spawner } from '../base/Spawner';

import * as Classes from '../classes';
import * as Effects from '../effects';
import { Allegiance, Character, SkillClassNames } from '../../shared/models/character';
import { ItemCreator } from '../helpers/item-creator';
import { Item } from '../../shared/models/item';
import { Locker } from '../../shared/models/container/locker';
import { VISUAL_EFFECTS, VisualEffect } from '../gidmetadata/visual-effects';

import { PartyManager } from '../helpers/party-manager';
import { BASE_SETTINGS, GameSettings, SettingsHelper } from '../helpers/settings-helper';
import { Account } from '../../shared/models/account';

const TICK_DIVISOR = 2;

const TickRates = {
  // tick players every second
  PlayerAction: TICK_DIVISOR,

  // npc actions every 2 seconds
  NPCAction: TICK_DIVISOR * 2,

  // tick spawners every half-second
  SpawnerTick: TICK_DIVISOR,
  PlayerSave: 30 * TICK_DIVISOR
};

export class GameWorld extends Room<GameState> {

  private allMapNames;

  private spawners: Spawner[] = [];

  private dropTables = {
    region: [],
    map: []
  };

  private ticks = 0;

  public partyManager: PartyManager;

  private gameSettings: GameSettings = clone(BASE_SETTINGS);

  private itemGC: any;

  private clearTimers: any[] = [];

  private usernameClientHash = {};

  get allSpawners() {
    return this.spawners;
  }

  get mapRegion() {
    return this.state.map.properties.region;
  }

  get mapName() {
    return this.state.mapName;
  }

  get maxSkill() {
    return this.state.map.properties.maxSkill || 1;
  }

  get maxCreatures() {
    return this.state.map.properties.maxCreatures || 0;
  }

  get canSpawnCreatures() {
    return this.state._mapNPCs.length < this.maxCreatures;
  }

  get decayRateHours() {
    return this.state.map.properties.itemExpirationHours || 6;
  }

  get decayChecksMinutes() {
    return this.state.map.properties.itemGarbageCollection || 60;
  }

  get mapRespawnPoint() {
    return { map: this.mapName, x: this.state.map.properties.respawnX, y: this.state.map.properties.respawnY };
  }

  private savePlayer(player: Player) {
    if(player.$$doNotSave) return;

    if(player._id) {
      delete player._id;
    }

    const savePlayer = player.toJSON();
    delete savePlayer.$fov;
    delete savePlayer._party;

    if(player.leftHand && player.leftHand.itemClass === 'Corpse') {
      savePlayer.leftHand = null;
    }

    if(player.rightHand && player.rightHand.itemClass === 'Corpse') {
      savePlayer.rightHand = null;
    }

    return DB.$players.update({ username: savePlayer.username, charSlot: savePlayer.charSlot }, { $set: savePlayer });
  }

  public sendMessageToUsernames(usernames: string[], message: string|any) {
    usernames.forEach(username => {
      const usernameObj = { username };
      const client = this.findClient(<Player>usernameObj);
      if(!client) return;

      this.sendClientLogMessage(client, message);
    });
  }

  private findClient(player: Player) {
    return get(this.usernameClientHash, [player.username, 'client']);
  }

  sendPlayerLogMessage(player: Player, messageData) {
    const client = this.findClient(player);
    if(!client) return;
    this.sendClientLogMessage(client, messageData);
  }

  sendClientLogMessage(client, messageData) {

    let overMessage = messageData;
    let overName = '';
    let overClass = '';
    let overTarget = '';
    let overDir = '';

    let grouping = 'always';

    if(isObject(messageData)) {
      const { message, name, subClass, target, dirFrom } = messageData;
      overMessage = message;
      overName = name;
      overClass = subClass;
      overTarget = target;
      overDir = dirFrom;

      if(overClass) {
        grouping = overClass.split(' ')[0];
      }
    }

    this.send(client, {
      action: 'log_message',
      name: overName,
      message: overMessage,
      subClass: overClass,
      target: overTarget,
      dirFrom: overDir,
      grouping
    });
  }

  showGroundWindow(player: Player) {
    const client = this.findClient(player);
    this.send(client, { action: 'show_ground' });
  }

  showTrainerWindow(player: Player, npc: NPC) {
    const client = this.findClient(player);
    this.send(client, { action: 'show_trainer', trainSkills: npc.trainSkills, classTrain: npc.classTrain, uuid: npc.uuid });
  }

  showShopWindow(player: Player, npc: NPC) {
    const client = this.findClient(player);
    this.send(client, { action: 'show_shop', vendorItems: npc.vendorItems, uuid: npc.uuid });
  }

  showBankWindow(player: Player, npc: NPC) {
    const client = this.findClient(player);
    this.send(client, { action: 'show_bank', uuid: npc.uuid, bankId: npc.bankId });
  }

  private async createLockerIfNotExist(player, regionId, lockerName, lockerId) {
    return DB.$characterLockers.update(
      { username: player.username, charSlot: player.charSlot, regionId, lockerId },
      { $setOnInsert: { items: [] }, $set: { lockerName } },
      { upsert: true }
    );
  }

  async loadLocker(player: Player, lockerId): Promise<Locker> {
    if(player.$$locker) {
      return await player.$$locker;
    }

    player.$$locker = DB.$characterLockers.findOne({ username: player.username, charSlot: player.charSlot, regionId: this.mapRegion, lockerId })
      .then(lock => lock && lock.lockerId ? new Locker(lock) : null);

    return player.$$locker;
  }

  updateLocker(player: Player, locker: Locker) {
    const client = this.findClient(player);
    this.saveLocker(player, locker);
    this.send(client, { action: 'update_locker', locker });
  }

  private saveLocker(player: Player, locker: Locker) {
    return DB.$characterLockers.update(
      { username: player.username, charSlot: player.charSlot, regionId: locker.regionId, lockerId: locker.lockerId },
      { $set: { lockerName: locker.lockerName, items: locker.allItems } }
    );
  }

  private async openLocker(player: Player, lockerName, lockerId) {
    const regionId = this.mapRegion;

    await this.createLockerIfNotExist(player, regionId, lockerName, lockerId);
    const lockers = await DB.$characterLockers.find({ username: player.username, charSlot: player.charSlot, regionId }).toArray();

    const client = this.findClient(player);
    this.send(client, { action: 'show_lockers', lockers, lockerId });
  }

  setPlayerXY(player, x, y) {
    player.x = x;
    player.y = y;
    this.state.calculateFOV(player);
    this.updatePos(player);
  }

  teleport(player, opts: { newMap, x, y, zChange?, zSet? }) {

    const { newMap, x, y, zChange, zSet } = opts;

    const client = this.findClient(player);

    if(newMap && !this.allMapNames[newMap]) {
      this.sendClientLogMessage(client, `Warning: map "${newMap}" does not exist.`);
      return;
    }

    this.setPlayerXY(player, x, y);

    if(zChange) {
      player.z += zChange;
    }

    if(zSet) {
      player.z = zSet;
    }

    this.state.resetPlayerStatus(player, true);

    if(newMap && player.map !== newMap) {
      player.map = newMap;
      this.prePlayerMapLeave(player);
      this.savePlayer(player);
      player.$$doNotSave = true;
      this.state.resetFOV(player);
      this.send(client, { action: 'change_map', map: newMap });
    }
  }

  addItemToGround(ref, item) {
    if(item.destroyOnDrop) {

      // legacy code for legacy players :P
      if(item.name === 'Succor Blob' && item.succorInfo && ref.isPlayer && ref.isPlayer()) {
        ref.doSuccor(item.succorInfo);
      }

      return;
    }

    if(item.itemClass !== 'Corpse') {
      this.setItemExpiry(item);
    }
    delete item.$heldBy;
    this.state.addItemToGround(ref, item);
  }

  removeItemFromGround(item) {
    this.removeItemExpiry(item);
    this.state.removeItemFromGround(item);
  }

  async onJoin(client, options) {
    const { charSlot, username } = options;

    const account = await this.getAccount(username);
    if(!account || account.colyseusId !== client.id) {
      this.send(client, {
        error: 'error_invalid_token',
        prettyErrorName: 'Invalid Session Id',
        prettyErrorDesc: 'You\'re either trying to say you\'re someone else, or your token is bad. To set this right, refresh the page.'
      });
      return false;
    }

    const playerData = await DB.$players.findOne({ username, map: this.state.mapName, charSlot, inGame: { $ne: true } });

    if(!playerData) {
      this.send(client, { error: 'invalid_char', prettyErrorName: 'Invalid Character Data', prettyErrorDesc: 'No idea how this happened!' });
      return false;
    }

    this.send(client, { action: 'set_map', map: this.state.formattedMap });

    const player = new Player(playerData);
    player.$$room = this;
    player.z = player.z || 0;
    player.initServer();
    this.setUpClassFor(player);
    this.state.addPlayer(player, client.id);

    player.inGame = true;
    this.savePlayer(player);

    player.respawnPoint = clone(this.mapRespawnPoint);

    this.usernameClientHash[player.username] = { client };

    this.setPlayerXY(player, player.x, player.y);
  }

  private async getAccount(username): Promise<Account> {
    return DB.$accounts.findOne({ username })
      .then(data => {
        if(data) return new Account(data);
        return null;
      });
  }

  private prePlayerMapLeave(player: Player) {
    this.corpseCheck(player);
    this.restoreCheck(player);
    this.doorCheck(player);
    player.z = 0;
  }

  private leaveGameAndSave(player: Player) {
    return DB.$players.update({ username: player.username, charSlot: player.charSlot }, { $set: { inGame: false } });
  }

  private autoReviveAndUncorpse(player: Player) {
    if(!player.isDead()) return;
    player.restore(false);
  }

  async onLeave(client) {
    const player = this.state.findPlayerByClientId(client.id);
    if(!player) return;

    delete this.usernameClientHash[player.username];

    this.state.removePlayer(client.id);
    player.inGame = false;

    // do not leave party if you're teleporting between maps
    if(!player.$$doNotSave && player.partyName) {
      this.partyManager.leaveParty(player);
    }

    this.autoReviveAndUncorpse(player);

    await this.leaveGameAndSave(player);
    this.prePlayerMapLeave(player);
    this.savePlayer(player);
  }

  onMessage(client, data) {
    if(!data.command) return;
    const player = this.state.findPlayerByClientId(client.id);

    if(!player) return;

    data.gameState = this.state;
    data.room = this;
    data.client = client;

    player.manageTraitPointPotentialGain(data.command);
    CommandExecutor.queueCommand(player, data.command, data);
  }

  executeCommand(player: Player, command, args: string) {
    const data = {
      gameState: this.state,
      room: this,
      args,
      command
    };

    CommandExecutor.executeCommand(player, data.command, data);
  }

  async onInit(opts) {

    this.allMapNames = opts.allMapNames;

    this.setPatchRate(500 / TICK_DIVISOR);
    this.setSimulationInterval(this.tick.bind(this), 1000 / TICK_DIVISOR);
    this.setState(new GameState({
      players: [],
      map: cloneDeep(require(opts.mapPath)),
      mapName: opts.mapName
    }));

    const timerData = await this.loadBossTimers();
    const spawnerTimers = timerData ? timerData.spawners : [];

    this.loadNPCsFromMap();
    this.loadSpawners(spawnerTimers);
    this.loadDropTables();
    this.loadGround();
    this.watchForItemDecay();
    this.loadGameSettings();

    this.initPartyManager();

    this.state.tick();
  }

  onDispose() {
    if(this.itemGC) {
      this.itemGC.cancel();
    }

    this.clearTimers.forEach(timer => clearTimeout(timer));

    this.saveGround();
    this.saveBossTimers();
    this.partyManager.stopEmitting();
  }

  public async loadGameSettings() {
    this.gameSettings = await SettingsHelper.loadSettings(this.mapRegion, this.mapName);
  }

  private initPartyManager() {
    this.partyManager = new PartyManager(this);
  }

  private async loadBossTimers() {
    return DB.$mapBossTimers.findOne({ mapName: this.state.mapName });
  }

  private saveBossTimers() {

    const timestamp = Date.now();

    const spawners = this.spawners.filter(spawner => {
      return spawner.shouldSerialize && spawner.currentTick > 0 && !spawner.hasAnyAlive();
    });

    const saveSpawners = spawners.map(spawner => ({
      x: spawner.x,
      y: spawner.y,
      currentTick: spawner.currentTick,
      timestamp
    }));

    if(saveSpawners.length > 0) {
      DB.$mapBossTimers.update({ mapName: this.state.mapName }, { $set: { spawners: saveSpawners } }, { upsert: true });
    }
  }

  private async loadGround() {
    let obj = await DB.$mapGroundItems.findOne({ mapName: this.state.mapName });
    if(!obj) obj = {};
    const groundItems = obj.groundItems || {};

    this.checkIfAnyItemsAreExpired(groundItems);

    this.state.groundItems = groundItems;
    DB.$mapGroundItems.remove({ mapName: this.state.mapName });
  }

  async saveGround() {
    DB.$mapGroundItems.update({ mapName: this.state.mapName }, { $set: { groundItems: this.state.serializableGroundItems() } }, { upsert: true });
  }

  private checkIfAnyItemsAreExpired(groundItems) {
    Logger.db(`Checking for expired items.`, this.state.mapName);

    Object.keys(groundItems).forEach(x => {
      Object.keys(groundItems[x]).forEach(y => {
        Object.keys(groundItems[x][y]).forEach(itemClass => {
          groundItems[x][y][itemClass] = compact(groundItems[x][y][itemClass].map(i => {
            const expired = this.hasItemExpired(i);

            if(expired) {
              const now = Date.now();
              const delta = Math.floor((now - i.expiresAt) / 1000);
              Logger.db(`Item ${i.name} has expired @ ${now} (delta: ${delta}sec).`, this.state.mapName, i);
            }

            return expired ? null : new Item(i);
          }));
        });
      });
    });
  }

  public createDarkness(startX: number, startY: number, radius: number, durationInMinutes: number): void {
    const darkTimestamp = Date.now();

    const timer = setTimeout(() => {
      this.state.removeDarkness(startX, startY, radius, darkTimestamp);
      pull(this.clearTimers, timer);
    }, durationInMinutes * 1000 * 15);

    this.state.addDarkness(startX, startY, radius, darkTimestamp);

    this.clearTimers.push(timer);
  }

  public removeDarkness(startX: number, startY: number, radius: number) {
    this.state.removeDarkness(startX, startY, radius, 0, true);
  }

  private watchForItemDecay() {
    const rule = new scheduler.RecurrenceRule();
    rule.minute = this.decayChecksMinutes;

    this.itemGC = scheduler.scheduleJob(rule, () => {
      this.checkIfAnyItemsAreExpired(this.state.groundItems);
    });
  }

  private removeItemExpiry(item: Item) {
    delete item.expiresAt;
  }

  private setItemExpiry(item: Item) {
    const expiry = new Date();
    const hours = item.owner ? this.decayRateHours * 4 : this.decayRateHours;
    expiry.setHours(expiry.getHours() + hours);
    item.expiresAt = expiry.getTime();
  }

  private hasItemExpired(item: Item) {
    return Date.now() > item.expiresAt;
  }

  private async loadDropTables() {
    this.dropTables.map = (await DB.$mapDrops.findOne({ mapName: this.state.mapName }) || {}).drops || [];
    if(this.mapRegion) {
      this.dropTables.region = (await DB.$regionDrops.findOne({ regionName: this.mapRegion }) || {}).drops || [];
    }
  }

  public addSpawner(spawner: Spawner) {
    this.spawners.push(spawner);
  }

  private loadNPCsFromMap() {
    const npcs = this.state.map.layers[MapLayer.NPCs].objects;

    if(npcs.length === 0) return;
    const normalNPCSpawner = new Spawner(this, { x: 0, y: 0, map: this.state.mapName }, {
      leashRadius: -1
    });

    normalNPCSpawner.canSlowDown = false;

    this.spawners.push(normalNPCSpawner);

    npcs.forEach(npcData => {
      const data = npcData.properties || {};
      data.name = npcData.name || this.determineNPCName(npcData);
      data.sprite = npcData.gid - this.state.map.tilesets[3].firstgid;
      data.x = npcData.x / 64;
      data.y = (npcData.y / 64) - 1;
      const npc = new NPC(data);
      npc.$$room = this;

      this.setUpClassFor(npc);

      try {
        if(npc.script) {
          const { setup, responses } = require(`${__dirname}/../scripts/npc/${npc.script}`);
          setup(npc);

          if(npc.hostility === 'Never') {
            npc.parser = new Parser();
            responses(npc);
          }
        }
      } catch(e) {
        Logger.error(e);
      }

      if(!npc.name) this.determineNPCName(npc);

      normalNPCSpawner.addNPC(npc);
    });
  }

  private loadSpawners(timerData: any[]) {
    const spawners = this.state.map.layers[MapLayer.Spawners].objects;

    const now = Date.now();

    spawners.forEach(spawnerData => {
      const spawner = require(`${__dirname}/../scripts/spawners/${spawnerData.properties.script}`);
      const spawnerProto = spawner[Object.keys(spawner)[0]];
      const properties = spawnerData.properties;
      const spawnerX = spawnerData.x / 64;
      const spawnerY = (spawnerData.y / 64) - 1;
      const spawnerOldData = find(timerData, { x: spawnerX, y: spawnerY });

      if(spawnerOldData) {
        const difference = Math.floor((now - spawnerOldData.timestamp) / 1000);
        properties.currentTick = spawnerOldData.currentTick + difference;
      }

      const spawnerObject = new spawnerProto(this, { map: this.state.mapName, x: spawnerX, y: spawnerY }, properties);
      this.spawners.push(spawnerObject);
    });
  }

  private determineNPCName(npc: NPC) {
    let func = 'human';

    switch(npc.allegiance) {
      case 'None': func = 'human'; break;
      case 'Pirates': func = 'dwarf'; break;
      case 'Townsfolk': func = 'human'; break;
      case 'Royalty': func = sample(['elf', 'highelf']); break;
      case 'Adventurers': func = 'human'; break;
      case 'Wilderness': func = sample(['fairy', 'highfairy']); break;
      case 'Underground': func = sample(['goblin', 'orc', 'ogre']); break;
    }

    if(func === 'human') return species[func]({ allowMultipleNames: false });
    return species[func](sample(['male', 'female']));
  }

  getPossibleMessageTargets(player: Character, findStr: string) {
    const allTargets = this.state.allPossibleTargets;
    const possTargets = allTargets.filter(target => {
      if(target.isDead()) return;

      const diffX = target.x - player.x;
      const diffY = target.y - player.y;

      if(!player.canSee(diffX, diffY)) return false;
      if(!player.canSeeThroughStealthOf(target)) return false;

      return this.doesTargetMatchSearch(target, findStr);
    });

    return possTargets;
  }

  public doesTargetMatchSearch(target: Character, findStr: string): boolean {
    return target.uuid === findStr || startsWith(target.name.toLowerCase(), findStr.toLowerCase());
  }

  private setUpClassFor(char: Character) {
    Classes[char.baseClass || 'Undecided'].becomeClass(char);
  }

  private tick() {
    this.ticks++;

    this.state.tick();

    // tick players every second or so
    if(this.ticks % TickRates.PlayerAction === 0) {
      this.state.tickPlayers();
    }

    if(this.ticks % TickRates.NPCAction === 0) {
      this.spawners.forEach(spawner => spawner.npcTick());
    }

    if(this.ticks % TickRates.SpawnerTick === 0) {
      this.spawners.forEach(spawner => spawner.tick());
    }

    // save players every minute or so
    if(this.ticks % TickRates.PlayerSave === 0) {
      this.state.allPlayers.forEach(player => this.savePlayer(player));

      // reset ticks
      this.ticks = 0;
    }

  }

  private async getAllLoot(npc: NPC, bonus = 0, sackOnly = false): Promise<Item[]> {
    const tables = [];

    if(this.dropTables.map.length > 0) {
      tables.push({
        table: new LootTable(this.dropTables.map, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(this.dropTables.region.length > 0) {
      tables.push({
        table: new LootTable(this.dropTables.region, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(npc.drops && npc.drops.length > 0) {
      tables.push({
        table: new LootTable(npc.drops, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(!sackOnly && npc.copyDrops && npc.copyDrops.length > 0) {
      const drops = compact(npc.copyDrops.map(({ drop, chance }) => {
        const item = get(npc, drop);
        if(!item) return null;
        return { result: item.name, chance };
      }));

      if(drops.length > 0) {
        tables.push({
          table: new LootTable(drops, bonus),
          func: LootFunctions.EachItem,
          args: 0
        });
      }
    }

    const items = LootRoller.rollTables(tables);

    const itemPromises: Array<Promise<Item>> = items.map(itemName => ItemCreator.getItemByName(itemName, this));
    const allItems: Item[] = await Promise.all(itemPromises);

    return allItems;
  }

  async calculateLootDrops(npc: NPC, killer: Character) {
    const bonus = killer.getTotalStat('luk');

    if(!killer.isPlayer()) {
      this.createCorpse(npc, []);
      return;
    }

    const allItems = await this.getAllLoot(npc, bonus);

    if(npc.gold) {
      const adjustedGold = this.calcAdjustedGoldGain(npc.gold);
      const gold = await ItemCreator.getGold(adjustedGold);
      allItems.push(gold);
    }

    this.createCorpse(npc, allItems);
  }

  public async createCorpse(target: Character, searchItems = []): Promise<Item> {
    const corpse = await ItemCreator.getItemByName('Corpse');
    corpse.sprite = target.sprite + 4;
    corpse.searchItems = searchItems;
    corpse.desc = `the corpse of a ${target.name}`;
    corpse.name = `${target.name} corpse`;

    this.addItemToGround(target, corpse);

    const isPlayer = target.isPlayer();
    corpse.$$isPlayerCorpse = isPlayer;

    target.$$corpseRef = corpse;

    if(!isPlayer) {
      corpse.tansFor = (<any>target).tansFor;
      (<any>corpse).npcUUID = target.uuid;
      corpse.$$playersHeardDeath = this.state.getPlayersInRange(target, 6).map(x => (<Player>x).username);
    }

    return corpse;
  }

  dropCorpseItems(corpse: Item, searcher?: Player) {
    if(!corpse || !corpse.searchItems) return;

    corpse.searchItems.forEach(item => {
      if(searcher && item.itemClass === 'Coin') {
        searcher.gainGold(item.value);
        searcher.sendClientMessage(`You loot ${item.value} gold coins from the corpse.`);

      } else {
        this.addItemToGround(corpse, item);
      }
    });

    corpse.searchItems = null;
  }

  removeCorpse(corpseRef: Item): void {
    if(corpseRef.$heldBy) {
      const player = this.state.findPlayer(corpseRef.$heldBy);
      player.sendClientMessage('The corpse fizzles from your hand.');
      this.corpseCheck(player, corpseRef);
    }

    this.removeItemFromGround(corpseRef);
  }

  public corpseCheck(player, specificCorpse?: Item) {

    let item = null;

    if(player.leftHand
    && player.leftHand.itemClass === 'Corpse'
    && (!specificCorpse || (specificCorpse && player.leftHand === specificCorpse) )) {
      item = player.leftHand;
      player.setLeftHand(null);
    }

    if(player.rightHand
    && player.rightHand.itemClass === 'Corpse'
    && (!specificCorpse || (specificCorpse && player.rightHand === specificCorpse) )) {
      item = player.rightHand;
      player.setRightHand(null);
    }

    if(item) {
      delete item.$heldBy;
      this.addItemToGround(player, item);
    }
  }

  private restoreCheck(player) {
    if(!player.isDead()) return;
    player.restore(false);
  }

  private doorCheck(player) {
    const interactable = this.state.getInteractable(player.x, player.y);
    if(interactable && interactable.type === 'Door') {
      player.teleportToRespawnPoint();
    }
  }

  public castEffectFromTrap(target: Character, obj: any) {
    if(!obj || !obj.properties || !obj.properties.effect) return;

    const { effect, caster } = obj.properties;
    const effectRef = new Effects[effect.name](effect);
    effectRef.casterRef = caster;

    effectRef.cast(target, target);
  }

  public placeTrap(x, y, user: Character, trap): boolean {

    const interactable = user.$$room.state.getInteractable(x, y, true, 'Trap');
    if(interactable) return false;

    const statCopy = user.sumStats;

    const trapInteractable = {
      x: x * 64,
      y: (y + 1) * 64,
      type: 'Trap',
      properties: {
        effect: trap.effect,
        caster: {
          name: user.name,
          username: (<any>user).username,
          casterStats: statCopy
        },
        setSkill: user.calcSkillLevel(SkillClassNames.Thievery),
        setStealth: user.getTotalStat('stealth'),
        timestamp: Date.now()
      }
    };

    user.$$room.state.addInteractable(trapInteractable);

    return true;
  }

  public drawEffect(player: Character, center: any, effect: VisualEffect, radius = 0) {
    const client = this.findClient(<Player>player);
    if(!client) return;

    const effectId = VISUAL_EFFECTS[effect];
    this.send(client, { action: 'draw_effect_r', effect: effectId, center, radius });
  }

  public updatePos(player: Player) {
    const client = this.findClient(player);
    if(!client) return;

    this.send(client, {
      action: 'update_pos',
      x: player.x,
      y: player.y,
      dir: player.dir,
      swimLevel: player.swimLevel,
      fov: player.$fov
    });
  }

  public updateFOV(player: Player) {
    const client = this.findClient(player);
    if(!client) return;

    this.send(client, {
      action: 'update_fov',
      fov: player.$fov
    });
  }

  public shareExpWithParty(player: Player, exp: number) {
    const party = player.party;

    const members = party.allMembers;

    if(members.length > 4) {
      exp = exp * 0.75;
    }

    if(members.length > 7) {
      exp = exp * 0.75;
    }

    exp = Math.floor(exp);

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = this.state.findPlayer(username);
      if(player.distFrom(partyMember) > 7) return;

        partyMember.gainExp(exp);
    });
  }

  public shareSkillWithParty(player: Player, skill: number) {
    const party = player.party;

    const members = party.allMembers;

    if(members.length > 4) {
      skill = skill * 0.75;
    }

    if(members.length > 7) {
      skill = skill * 0.75;
    }

    skill = Math.floor(skill);

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = this.state.findPlayer(username);
      if(player.distFrom(partyMember) > 7) return;

      partyMember.gainSkill(skill);
    });
  }

  public shareRepWithParty(player: Player, allegiance: Allegiance, delta: number) {
    const party = player.party;

    const members = party.allMembers;

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = this.state.findPlayer(username);
      if(player.distFrom(partyMember) > 7) return;

      partyMember.changeRep(allegiance, delta, true);
    });
  }

  public calcAdjustedGoldGain(gold: number) {
    return Math.floor(gold * this.gameSettings.goldMult);
  }

  public calcAdjustedSkillGain(skill: number) {
    return Math.floor(skill * this.gameSettings.skillMult);
  }

  public calcAdjustedXPGain(xp: number) {
    return Math.floor(xp * this.gameSettings.xpMult);
  }

  public calcAdjustedTraitTimer(timerValue: number) {
    return Math.floor(timerValue * this.gameSettings.traitTimerMult);
  }

  public calcAdjustedTraitGain(traitValue: number) {
    return Math.floor(traitValue * this.gameSettings.traitGainMult);
  }

  public getRandomStatInformation() {
    return {
      numberOfRandomStatsForItems: this.gameSettings.numberOfRandomStatsForItems,
      randomStatMaxValue: this.gameSettings.randomStatMaxValue,
      randomStatChance: this.gameSettings.randomStatChance
    };
  }
}
