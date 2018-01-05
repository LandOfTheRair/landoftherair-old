
import { omitBy, startsWith, isString, isObject, cloneDeep, sample, find, compact, get, filter, clone, pull, extend } from 'lodash';
import * as Deepstream from 'deepstream.io-client-js';

import { Parser } from 'mingy';

import { Room } from 'colyseus';
import { GameState } from '../../shared/models/gamestate';
import { MapLayer } from '../../shared/models/maplayer';

import { DB } from '../database';
import { Player } from '../../shared/models/player';

import { CommandExecutor } from '../helpers/command-executor';
import { NPC } from '../../shared/models/npc';
import { Logger } from '../logger';
import { Spawner } from '../base/Spawner';

import { Character } from '../../shared/models/character';
import { ItemCreator } from '../helpers/item-creator';
import { Item } from '../../shared/models/item';
import { Locker } from '../../shared/models/container/locker';
import { VISUAL_EFFECTS, VisualEffect } from '../gidmetadata/visual-effects';

import { PartyManager } from '../helpers/party-manager';
import { BASE_SETTINGS, GameSettings, SettingsHelper } from '../helpers/settings-helper';
import { DeepstreamCleaner } from '../deepstream-cleaner';
import { NPCLoader } from '../helpers/npc-loader';
import { AccountHelper } from '../helpers/account-helper';
import { DeathHelper } from '../helpers/death-helper';
import { CharacterHelper } from '../helpers/character-helper';
import { GroundHelper } from '../helpers/ground-helper';
import { LockerHelper } from '../helpers/locker-helper';
import { BankHelper } from '../helpers/bank-helper';

export type CombatEffect = 'hit-min' | 'hit-mid' | 'hit-max' | 'hit-magic' | 'hit-heal' | 'hit-buff'
| 'block-dodge' | 'block-armor' | 'block-shield' | 'block-weapon';

const TICK_TIMER = 500;

const TickRatesPerTimer = {

  BuffTick: 2,

  // tick players every second
  CharacterAction: 2,

  // tick spawners every second
  SpawnerTick: 2,

  // save players every minute
  PlayerSave: 120
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

  private deepstream: any;

  private itemCreator: ItemCreator;

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

  get disableCreatureSpawn() {
    return this.state.map.properties.disableCreatureRespawn;
  }

  get canSpawnCreatures() {
    return !this.disableCreatureSpawn && this.state._mapNPCs.length < this.maxCreatures;
  }

  get decayRateHours() {
    return this.state.map.properties.itemExpirationHours || 6;
  }

  get decayChecksMinutes() {
    return this.state.map.properties.itemGarbageCollection || 60;
  }

  get mapRespawnPoint() {
    return {
      map: this.state.map.properties.respawnMap || this.mapName,
      x: this.state.map.properties.respawnX,
      y: this.state.map.properties.respawnY
    };
  }

  get script() {
    return this.state.map.properties.script;
  }

  async onInit(opts) {
    this.allMapNames = opts.allMapNames;

    this.itemCreator = new ItemCreator();

    this.deepstream = Deepstream(process.env.DEEPSTREAM_URL);

    this.setPatchRate(1000);
    this.setSimulationInterval(this.tick.bind(this), TICK_TIMER);
    this.setState(new GameState({
      players: [],
      map: cloneDeep(require(opts.mapPath)),
      mapName: opts.mapName,
      deepstream: this.deepstream,
      createdId: opts.party
    }));

    this.deepstream.login({ map: this.mapName, token: process.env.DEEPSTREAM_TOKEN });

    const timerData = await this.loadBossTimers();
    const spawnerTimers = timerData ? timerData.spawners : [];

    this.loadNPCsFromMap();
    this.loadSpawners(spawnerTimers);
    this.loadDropTables();
    this.loadGameSettings();

    this.initGround();
    this.initPartyManager();

    this.state.tick();

    if(this.script) {
      const { setup } = require(__dirname + '/../scripts/rooms/' + this.script);
      setup(this);
    }
  }

  onDispose() {
    this.state.isDisposing = true;

    if(this.itemGC) {
      this.itemGC.cancel();
    }

    this.clearTimers.forEach(timer => clearTimeout(timer));

    GroundHelper.saveGround(this);
    this.saveBossTimers();
    this.partyManager.stopEmitting();

    DeepstreamCleaner.cleanMap(this.mapName, this.deepstream);
  }

  async onJoin(client, options) {
    const { charSlot, username } = options;

    const account = await AccountHelper.getAccount(username);
    if(!account || account.colyseusId !== client.id) {
      this.send(client, {
        error: 'error_invalid_token',
        prettyErrorName: 'Invalid Session Id',
        prettyErrorDesc: 'You\'re either trying to say you\'re someone else, or your token is bad. To set this right, refresh the page.'
      });
      return false;
    }

    const playerData = await DB.$players.findOne({ username, map: this.mapName, charSlot, inGame: { $ne: true } });

    if(!playerData) {
      this.send(client, { error: 'invalid_char', prettyErrorName: 'Invalid Character Data', prettyErrorDesc: 'No idea how this happened!' });
      return false;
    }

    this.send(client, { action: 'set_map', map: this.state.formattedMap });

    const player = new Player(playerData);
    player.$$room = this;
    player.z = player.z || 0;
    player.initServer();
    CharacterHelper.setUpClassFor(player);
    this.state.addPlayer(player, client.id);

    player.inGame = true;
    this.savePlayer(player);

    player.respawnPoint = clone(this.mapRespawnPoint);

    this.usernameClientHash[player.username] = { client };

    this.setPlayerXY(player, player.x, player.y);
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

    DeathHelper.autoReviveAndUncorpse(player);

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

    data.command = (data.command || '').trim();
    data.args = (data.args || '').trim().split('  ').join(' ');

    player.manageTraitPointPotentialGain(data.command);
    CommandExecutor.queueCommand(player, data.command, data);
  }

  private async savePlayer(player: Player, extraOpts = {}) {
    if(player.$$doNotSave) return;

    const savePlayer = player.toSaveObject();
    savePlayer.fov = null;
    savePlayer._party = null;

    extend(savePlayer, extraOpts);

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

  showBankWindow(player: Player, npc: NPC, banks: any) {
    const client = this.findClient(player);
    this.send(client, { action: 'show_bank', uuid: get(npc || {}, 'uuid'), bankId: get(npc || {}, 'bankId'), banks });
  }

  showAlchemyWindow(player: Player, npc: NPC) {
    const client = this.findClient(player);
    this.send(client, { action: 'show_ts', tradeskill:'Alchemy', uuid: npc.uuid });
  }

  showSpellforgingWindow(player: Player, npc: NPC) {
    const client = this.findClient(player);
    this.send(client, { action: 'show_ts', tradeskill: 'Spellforging', uuid: npc.uuid });
  }

  showLockerWindow(player: Player, lockers, lockerId) {
    const client = this.findClient(player);
    this.send(client, { action: 'show_lockers', lockers, lockerId });
  }

  openLocker(player: Player, lockerName, lockerId) {
    LockerHelper.openLocker(player, lockerName, lockerId);
  }

  updateLocker(player: Player, locker: Locker) {
    LockerHelper.saveLocker(player, locker);
    const client = player.$$room.findClient(player);
    this.send(client, { action: 'update_locker', locker });
  }

  async openBank(player: Player, npc: NPC) {
    const banks = await BankHelper.openBank(player, npc);
    player.$$banks = banks;
    this.showBankWindow(player, npc, player.$$banks);
  }

  depositBankMoney(player: Player, region: string, amount: number) {
    if(!player.$$banks) return false;

    amount = Math.round(+amount);
    if(isNaN(amount)) return false;

    if(amount < 0) return false;
    if(amount > player.gold) amount = player.gold;

    player.$$banks = player.$$banks || {};
    player.$$banks[region] = player.$$banks[region] || 0;
    player.$$banks[region] += amount;

    player.loseGold(amount);

    BankHelper.saveBank(player);
    this.showBankWindow(player, null, player.$$banks);
    return amount;
  }

  withdrawBankMoney(player: Player, region: string, amount: number) {
    if(!player.$$banks) return false;

    amount = Math.round(+amount);
    if(isNaN(amount)) return false;
    if(amount < 0) return false;
    player.$$banks = player.$$banks || {};
    player.$$banks[region] = player.$$banks[region] || 0;

    if(amount > player.$$banks[region]) amount = player.$$banks[region];

    player.$$banks[region] -= amount;
    player.gainGold(amount);
    BankHelper.saveBank(player);
    this.showBankWindow(player, null, player.$$banks);
    return amount;
  }

  setPlayerXY(player, x, y) {
    player.x = x;
    player.y = y;
    this.state.calculateFOV(player);
    this.updatePos(player);
  }

  async teleport(player, opts: { newMap, x, y, zChange?, zSet? }) {

    const { newMap, x, y, zChange, zSet } = opts;

    const client = this.findClient(player);
    if(!client) return;

    if(newMap && !this.allMapNames[newMap]) {
      this.sendClientLogMessage(client, `Warning: map "${newMap}" does not exist.`);
      return;
    }

    if(!newMap || player.map === newMap) {
      this.setPlayerXY(player, x, y);
    }

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
      await this.savePlayer(player, { x, y });
      player.$$doNotSave = true;
      this.state.resetFOV(player);
      this.send(client, { action: 'change_map', map: newMap, party: player.partyName });
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
      this.itemCreator.setItemExpiry(item, item.owner ? this.decayRateHours * 4 : this.decayRateHours);
    }

    item.$heldBy = null;
    this.state.addItemToGround(ref, item);
  }

  removeItemFromGround(item) {
    this.itemCreator.removeItemExpiry(item);
    this.state.removeItemFromGround(item);
  }

  private prePlayerMapLeave(player: Player) {
    DeathHelper.corpseCheck(player);
    DeathHelper.autoReviveAndUncorpse(player);
    this.doorCheck(player);
    player.z = 0;
  }

  private leaveGameAndSave(player: Player) {
    return DB.$players.update({ username: player.username, charSlot: player.charSlot }, { $set: { inGame: false } });
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

  public async loadGameSettings() {
    this.gameSettings = await SettingsHelper.loadSettings(this.mapRegion, this.mapName);
  }

  private initGround() {
    GroundHelper.loadGround(this);
    this.itemGC = GroundHelper.watchForItemDecay(this);
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

    npcs.forEach(async npcData => {
      const data = npcData.properties || {};
      data.name = npcData.name || NPCLoader.determineNPCName(npcData);
      data.sprite = npcData.gid - this.state.map.tilesets[3].firstgid;
      data.x = npcData.x / 64;
      data.y = (npcData.y / 64) - 1;
      const npc = new NPC(data);
      npc.$$room = this;

      CharacterHelper.setUpClassFor(npc);

      try {
        if(npc.script) {
          const { setup, responses } = require(`${__dirname}/../scripts/npc/${npc.script}`);
          await setup(npc);

          if(npc.hostility === 'Never') {
            npc.parser = new Parser();
            responses(npc);
          }
        }
      } catch(e) {
        Logger.error(e);
      }

      if(!npc.name) NPCLoader.determineNPCName(npc);

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

  private tick() {
    this.ticks++;

    if((this.ticks % TickRatesPerTimer.CharacterAction) === 0) {
      this.state.tickPlayers();
      this.spawners.forEach(spawner => spawner.npcTick(this.ticks % 4 === 0));
    }

    if((this.ticks % TickRatesPerTimer.BuffTick) === 0) {
      this.state.tick();
    }

    if((this.ticks % TickRatesPerTimer.SpawnerTick) === 0) {
      this.spawners.forEach(spawner => spawner.tick());
    }

    // save players every minute or so
    if((this.ticks % TickRatesPerTimer.PlayerSave) === 0) {
      this.state.allPlayers.forEach(player => this.savePlayer(player));

      GroundHelper.saveGround(this);
      // reset ticks
      this.ticks = 0;
    }

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

  dropChestItems(chest: any, searcher?: Player) {
    if(!chest || !chest.searchItems) return;

    chest.searchItems.forEach(item => {
      if(searcher && item.itemClass === 'Coin') {
        searcher.gainGold(item.value);
        searcher.sendClientMessage(`You loot ${item.value} gold coins from the chest.`);

      } else {
        this.addItemToGround({ x: chest.x / 64, y: (chest.y / 64) - 1 }, item);
      }
    });

    chest.searchItems = null;
  }

  removeCorpse(corpseRef: Item): void {
    if(corpseRef.$heldBy) {
      const player = this.state.findPlayer(corpseRef.$heldBy);
      player.sendClientMessage('The corpse fizzles from your hand.');
      DeathHelper.corpseCheck(player, corpseRef);
    }

    this.removeItemFromGround(corpseRef);
  }

  private doorCheck(player) {
    const interactable = this.state.getInteractable(player.x, player.y);
    if(interactable && interactable.type === 'Door') {
      player.teleportToRespawnPoint();
    }
  }

  public drawEffect(player: Character, center: any, effect: VisualEffect, radius = 0) {
    if(!player.isPlayer()) return;

    const client = this.findClient(<Player>player);
    if(!client) return;

    const effectId = VISUAL_EFFECTS[effect];
    this.send(client, { action: 'draw_effect_r', effect: effectId, center, radius });
  }

  public combatEffect(player: Character, effect: CombatEffect, enemyUUID: string) {
    if(!player.isPlayer()) return;

    const client = this.findClient(<Player>player);
    if(!client) return;

    this.send(client, { action: 'draw_effect_c', effect, enemyUUID });
  }

  public updatePos(player: Character) {
    if(player.isPlayer && !player.isPlayer()) return;

    const client = this.findClient(<Player>player);
    if(!client) return;

    this.send(client, {
      action: 'update_pos',
      x: player.x,
      y: player.y,
      dir: player.dir,
      swimLevel: player.swimLevel,
      fov: player.fov
    });
  }

  public updateFOV(player: Player) {
    const client = this.findClient(player);
    if(!client) return;

    this.send(client, {
      action: 'update_fov',
      fov: player.fov
    });
  }

  public resetMacros(player: Player) {
    const client = this.findClient(player);
    if(!client) return;

    this.send(client, {
      action: 'update_macros'
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
