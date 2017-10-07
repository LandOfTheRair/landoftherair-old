
import { omitBy, startsWith, isString, isObject, cloneDeep, sample, find, compact, get, filter } from 'lodash';

import * as scheduler from 'node-schedule';

import { Parser } from 'mingy';

import { LootRoller, LootFunctions, LootTable } from 'lootastic';
import { species } from 'fantastical';

import { Room } from 'colyseus';
import { GameState } from '../../models/gamestate';
import { MapLayer } from '../../models/maplayer';

import { DB } from '../database';
import { Player } from '../../models/player';

import { CommandExecutor } from '../helpers/command-executor';
import { NPC } from '../../models/npc';
import { Logger } from '../logger';
import { Spawner } from '../base/Spawner';

import * as Classes from '../classes';
import { Character } from '../../models/character';
import { ItemCreator } from '../helpers/item-creator';
import { Item } from '../../models/item';
import { Locker } from '../../models/container/locker';
import { VISUAL_EFFECTS, VisualEffect } from '../gidmetadata/visual-effects';

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

  get allSpawners() {
    return this.spawners;
  }

  get mapRegion() {
    return this.state.map.properties.region;
  }

  get maxSkill() {
    return this.state.map.properties.maxSkill || 1;
  }

  get maxCreatures() {
    return this.state.map.properties.maxCreatures || 0;
  }

  get canSpawnCreatures() {
    return this.state.mapNPCs.length < this.maxCreatures;
  }

  get decayRateHours() {
    return this.state.map.properties.itemExpirationHours || 6;
  }

  get decayChecksMinutes() {
    return this.state.map.properties.itemGarbageCollection || 60;
  }

  constructor(opts) {
    super(opts);

    this.allMapNames = opts.allMapNames;

    this.setPatchRate(500 / TICK_DIVISOR);
    this.setSimulationInterval(this.tick.bind(this), 1000 / TICK_DIVISOR);
    this.setState(new GameState({
      players: [],
      map: cloneDeep(require(opts.mapPath)),
      mapName: opts.mapName
    }));

    this.onInit();
  }

  savePlayer(player: Player) {
    if(player.$$doNotSave) return;

    if(player._id) {
      delete player._id;
    }

    const savePlayer = player.toJSON();
    delete savePlayer.$fov;

    if(player.leftHand && player.leftHand.itemClass === 'Corpse') {
      savePlayer.leftHand = null;
    }

    if(player.rightHand && player.rightHand.itemClass === 'Corpse') {
      savePlayer.rightHand = null;
    }

    return DB.$players.update({ username: savePlayer.username, charSlot: savePlayer.charSlot }, { $set: savePlayer });
  }

  findClient(player: Player) {
    return find(this.clients, { username: player.username });
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
    return DB.$characterLockers.findOne({ username: player.username, charSlot: player.charSlot, regionId: this.mapRegion, lockerId })
      .then(lock => lock && lock.lockerId ? new Locker(lock) : null);
  }

  updateLocker(player: Player, locker: Locker) {
    const client = this.findClient(player);
    this.saveLocker(player, locker);
    this.send(client, { action: 'update_locker', locker });
  }

  saveLocker(player: Player, locker: Locker) {
    return DB.$characterLockers.update(
      { username: player.username, charSlot: player.charSlot, regionId: locker.regionId, lockerId: locker.lockerId },
      { $set: { lockerName: locker.lockerName, items: locker.allItems } }
    );
  }

  async openLocker(player: Player, lockerName, lockerId) {
    const regionId = this.mapRegion;

    await this.createLockerIfNotExist(player, regionId, lockerName, lockerId);
    const lockers = await DB.$characterLockers.find({ username: player.username, charSlot: player.charSlot, regionId }).toArray();

    const client = this.findClient(player);
    this.send(client, { action: 'show_lockers', lockers, lockerId });
  }

  teleport(player, { newMap, x, y }) {
    const client = this.findClient(player);

    if(newMap && !this.allMapNames[newMap]) {
      this.sendClientLogMessage(client, `Warning: map "${newMap}" does not exist.`);
      return;
    }

    player.x = x;
    player.y = y;

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

  // TODO check if player is in this map, return false if not - also, modify this to take a promise? - also fail if in game already
  requestJoin(opts) {
    // console.log('req', opts);
    return true;
  }

  async onJoin(client, options) {
    const playerData = await DB.$players.findOne({ username: client.username, map: this.state.mapName, charSlot: options.charSlot, inGame: { $ne: true } });

    if(!playerData) {
      this.send(client, { error: 'invalid_char', prettyErrorName: 'Invalid Character Data', prettyErrorDesc: 'No idea how this happened!' });
      return false;
    }

    this.send(client, { action: 'set_map', map: this.state.map });

    const player = new Player(playerData);
    player.$$room = this;
    player.initServer();
    this.setUpClassFor(player);
    this.state.addPlayer(player);

    player.inGame = true;
    this.savePlayer(player);

    if(this.state.mapName === 'Tutorial' && !player.respawnPoint) {
      player.respawnPoint = { x: 14, y: 14, map: 'Tutorial' };
    }
  }

  prePlayerMapLeave(player: Player) {
    this.corpseCheck(player);
    this.restoreCheck(player);
    this.doorCheck(player);

    if(this.state.mapName === 'Tutorial' && player.respawnPoint.map === 'Tutorial') {
      player.respawnPoint = { x: 68, y: 13, map: 'Rylt' };
    }
  }

  leaveGameAndSave(player: Player) {
    return DB.$players.update({ username: player.username, charSlot: player.charSlot }, { $set: { inGame: false } });
  }

  async onLeave(client) {
    const player = this.state.findPlayer(client.username);
    this.state.removePlayer(client.username);
    player.inGame = false;
    await this.leaveGameAndSave(player);
    this.prePlayerMapLeave(player);
    this.savePlayer(player);
  }

  onMessage(client, data) {
    if(!data.command) return;
    const player = this.state.findPlayer(client.username);

    data.gameState = this.state;
    data.room = this;
    data.client = client;

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

  async onInit() {
    const timerData = await this.loadBossTimers();
    const spawnerTimers = timerData ? timerData.spawners : [];

    this.loadNPCsFromMap();
    this.loadSpawners(spawnerTimers);
    this.loadDropTables();
    this.loadGround();
    this.watchForItemDecay();
  }

  onDispose() {
    this.saveGround();
    this.saveBossTimers();
  }

  async loadBossTimers() {
    return DB.$mapBossTimers.findOne({ mapName: this.state.mapName });
  }

  saveBossTimers() {
    const spawners = this.spawners.filter(spawner => spawner.shouldSerialize && spawner.currentTick > 0);
    const saveSpawners = spawners.map(spawner => ({ x: spawner.x, y: spawner.y, currentTick: spawner.currentTick }));

    if(saveSpawners.length > 0) {
      DB.$mapBossTimers.update({ mapName: this.state.mapName }, { $set: { spawners: saveSpawners } }, { upsert: true });
    }
  }

  async loadGround() {
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

  checkIfAnyItemsAreExpired(groundItems) {
    Object.keys(groundItems).forEach(x => {
      Object.keys(groundItems[x]).forEach(y => {
        Object.keys(groundItems[x][y]).forEach(itemClass => {
          groundItems[x][y][itemClass] = compact(groundItems[x][y][itemClass].map(i => this.hasItemExpired(i) ? null : new Item(i)));
        });
      });
    });
  }

  watchForItemDecay() {
    const rule = new scheduler.RecurrenceRule();
    rule.minute = this.decayChecksMinutes;

    scheduler.scheduleJob(rule, () => {
      this.checkIfAnyItemsAreExpired(this.state.groundItems);
    });
  }

  removeItemExpiry(item: Item) {
    delete item.expiresAt;
  }

  setItemExpiry(item: Item) {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + this.decayRateHours);
    item.expiresAt = expiry.getTime();
  }

  hasItemExpired(item: Item) {
    return Date.now() > item.expiresAt;
  }

  async loadDropTables() {
    this.dropTables.map = (await DB.$mapDrops.findOne({ mapName: this.state.mapName }) || {}).drops || [];
    if(this.mapRegion) {
      this.dropTables.region = (await DB.$regionDrops.findOne({ regionName: this.mapRegion }) || {}).drops || [];
    }
  }

  loadNPCsFromMap() {
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

  loadSpawners(timerData: any[]) {
    const spawners = this.state.map.layers[MapLayer.Spawners].objects;

    spawners.forEach(spawnerData => {
      const spawner = require(`${__dirname}/../scripts/spawners/${spawnerData.properties.script}`);
      const spawnerProto = spawner[Object.keys(spawner)[0]];
      const properties = spawnerData.properties;
      const spawnerX = spawnerData.x / 64;
      const spawnerY = (spawnerData.y / 64) - 1;
      const spawnerOldData = find(timerData, { x: spawnerX, y: spawnerY });

      if(spawnerOldData) {
        properties.currentTick = spawnerOldData.currentTick;
      }

      const spawnerObject = new spawnerProto(this, { map: this.state.mapName, x: spawnerX, y: spawnerY }, properties);
      this.spawners.push(spawnerObject);
    });
  }

  determineNPCName(npc: NPC) {
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
    const allTargets = (<any>this.state.mapNPCs).concat(this.state.players);
    const possTargets = allTargets.filter(target => {
      if(target.isDead()) return;

      const diffX = target.x - player.x;
      const diffY = target.y - player.y;

      if(!player.canSee(diffX, diffY)) return false;
      if(!player.canSeeThroughStealthOf(target)) return false;

      return target.uuid === findStr || startsWith(target.name.toLowerCase(), findStr.toLowerCase());
    });

    return possTargets;
  }

  setUpClassFor(char: Character) {
    Classes[char.baseClass || 'Undecided'].becomeClass(char);
  }

  tick() {
    this.ticks++;

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
      this.state.players.forEach(player => this.savePlayer(player));

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

    const itemPromises: Array<Promise<Item>> = items.map(itemName => ItemCreator.getItemByName(itemName));
    const allItems: Item[] = await Promise.all(itemPromises);

    return allItems;
  }

  async calculateLootDrops(npc: NPC, killer: Character) {
    const bonus = killer.getTotalStat('luk');

    const allItems = await this.getAllLoot(npc, bonus);

    if(npc.gold) {
      const gold = await ItemCreator.getGold(npc.gold);
      allItems.push(gold);
    }

    this.createCorpse(npc, allItems);
  }

  async createCorpse(target: Character, searchItems) {
    const corpse = await ItemCreator.getItemByName('Corpse');
    corpse.sprite = target.sprite + 4;
    corpse.searchItems = searchItems;
    corpse.tansFor = (<any>target).tansFor;
    corpse.desc = `the corpse of a ${target.name}`;

    this.addItemToGround(target, corpse);

    target.$$corpseRef = corpse;
    (<any>corpse).npcUUID = target.uuid;
    corpse.$$isPlayerCorpse = target.isPlayer();
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

  corpseCheck(player) {

    let item = null;

    if(player.leftHand && player.leftHand.itemClass === 'Corpse') {
      item = player.leftHand;
      player.setLeftHand(null);
    }

    if(player.rightHand && player.rightHand.itemClass === 'Corpse') {
      item = player.rightHand;
      player.setRightHand(null);
    }

    if(item) {
      delete item.$heldBy;
      this.addItemToGround(player, item);
    }
  }

  restoreCheck(player) {
    if(!player.isDead()) return;
    player.restore(false);
  }

  doorCheck(player) {
    const interactables = this.state.map.layers[MapLayer.Interactables].objects;
    const interactable = find(interactables, { x: (player.x) * 64, y: (player.y + 1) * 64 });
    if(interactable && interactable.type === 'Door') {
      player.teleportToRespawnPoint();
    }
  }

  drawEffect(player: Player, center: any, effect: VisualEffect, radius = 0) {
    const client = this.findClient(player);
    const effectId = VISUAL_EFFECTS[effect];
    this.send(client, { action: 'draw_effect_r', effect: effectId, center, radius });
  }
}
