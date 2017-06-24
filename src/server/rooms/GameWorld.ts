
import { omitBy, startsWith, isString, isObject, cloneDeep, sample, find, compact } from 'lodash';

import * as scheduler from 'node-schedule';

import { Parser } from 'mingy';

import { LootRoller, LootFunctions, LootTable } from 'lootastic';
import { species } from 'fantastical';

import { Room } from 'colyseus';
import { GameState, MapLayer } from '../../models/gamestate';

import { DB } from '../database';
import { Player } from '../../models/player';

import { CommandExecutor } from '../helpers/command-executor';
import { NPC } from '../../models/npc';
import { Logger } from '../logger';
import { Spawner } from '../base/spawner';

import * as Classes from '../classes';
import { Character } from '../../models/character';
import { ItemCreator } from '../helpers/item-creator';
import { Item } from '../../models/item';
import { Locker } from '../../models/locker';

const TickRates = {
  PlayerAction: 60,
  PlayerSave: 360
};

export class GameWorld extends Room<GameState> {

  private allMapNames;

  private spawners: Spawner[] = [];

  private dropTables = {
    region: [],
    map: []
  };

  private ticks = {
    Player: 0
  };

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

    this.setPatchRate(1000 / 20);
    this.setSimulationInterval(this.tick.bind(this), 1000 / 60);
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
    this.sendClientLogMessage(client, messageData);
  }

  sendClientLogMessage(client, messageData) {

    let overMessage = messageData;
    let overName = '';
    let overClass = '';

    if(isObject(messageData)) {
      const { message, name, subClass } = messageData;
      overMessage = message;
      overName = name;
      overClass = subClass;
    }

    this.send(client, { action: 'log_message', name: overName, message: overMessage, subClass: overClass });
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
      { $set: { lockerName: locker.lockerName, items: locker.items } }
    );
  }

  async openLocker(client, player: Player, lockerName, lockerId) {
    const regionId = this.mapRegion;

    await this.createLockerIfNotExist(player, regionId, lockerName, lockerId);
    const lockers = await DB.$characterLockers.find({ username: player.username, charSlot: player.charSlot, regionId }).toArray();

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

    this.state.resetPlayerStatus(player);

    if(newMap && player.map !== newMap) {
      player.map = newMap;
      this.savePlayer(player);
      player.$$doNotSave = true;
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
    const playerData = await DB.$players.findOne({ username: client.username, map: this.state.mapName, charSlot: options.charSlot });

    if(!playerData) {
      this.send(client, { error: 'invalid_char', prettyErrorName: 'Invalid Character Data', prettyErrorDesc: 'No idea how this happened!' });
      return false;
    }

    const player = new Player(playerData);
    player.$$room = this;
    player.initServer();
    this.setUpClassFor(player);
    this.state.addPlayer(player);

    if(this.state.mapName === 'Tutorial' && !player.respawnPoint) {
      player.respawnPoint = { x: 14, y: 14, map: 'Tutorial' };
    }
  }

  onLeave(client) {
    const player = this.state.findPlayer(client.username);
    this.corpseCheck(player);
    this.restoreCheck(player);
    this.doorCheck(player);

    if(this.state.mapName === 'Tutorial' && !player.respawnPoint) {
      player.respawnPoint = { x: 68, y: 13, map: 'Antania' };
    }

    this.savePlayer(player);
    this.state.removePlayer(client.username);
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

  // TODO retrieve boss timers
  onInit() {
    this.loadNPCsFromMap();
    this.loadSpawners();
    this.loadDropTables();
    this.loadGround();
    this.watchForItemDecay();
  }

  // TODO store boss timers
  onDispose() {
    this.saveGround();
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
    DB.$mapGroundItems.update({ mapName: this.state.mapName }, { $set: { groundItems: this.state.groundItems } }, { upsert: true });
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
    this.dropTables.map = await DB.$mapDrops.findOne({ mapName: this.state.mapName }).drops || [];
    if(this.mapRegion) {
      this.dropTables.region = await DB.$regionDrops.findOne({ regionName: this.mapRegion }).drops || [];
    }
  }

  loadNPCsFromMap() {
    const npcs = this.state.map.layers[MapLayer.NPCs].objects;

    npcs.forEach(npcData => {
      const data = npcData.properties;
      data.name = npcData.name;
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

      this.state.addNPC(npc);
    });
  }

  loadSpawners() {
    const spawners = this.state.map.layers[MapLayer.Spawners].objects;

    spawners.forEach(spawnerData => {
      const spawner = require(`${__dirname}/../scripts/spawners/${spawnerData.properties.script}`);
      const spawnerProto = spawner[Object.keys(spawner)[0]];
      this.spawners.push(new spawnerProto(this, { map: this.state.mapName, x: spawnerData.x, y: spawnerData.y }));
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

  getPossibleMessageTargets(player: Player, findStr: string) {
    const allTargets = this.state.mapNPCs;
    const possTargets = allTargets.filter(target => {
      const diffX = target.x - player.x;
      const diffY = target.y - player.y;

      if(!player.canSee(diffX, diffY)) return false;

      return target.uuid === findStr || startsWith(target.name.toLowerCase(), findStr.toLowerCase());
    });

    return possTargets;
  }

  setUpClassFor(char: Character) {
    Classes[char.baseClass || 'Undecided'].becomeClass(char);
  }

  tick() {
    this.ticks.Player++;

    // tick players every second or so
    if(this.ticks.Player % TickRates.PlayerAction === 0) {
      this.state.tickPlayers();
      this.spawners.forEach(spawner => spawner.npcTick());
    }

    // save players every minute or so
    if(this.ticks.Player % TickRates.PlayerSave === 0) {
      this.state.players.forEach(player => this.savePlayer(player));
    }

    this.spawners.forEach(spawner => spawner.tick());
  }

  async calculateLootDrops(npc: NPC, killer: Character) {
    const tables = [];
    const bonus = killer.getTotalStat('luk');

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

    const items = LootRoller.rollTables(tables);

    const itemPromises: Array<Promise<Item>> = items.map(itemName => ItemCreator.getItemByName(itemName));
    const allItems: Item[] = await Promise.all(itemPromises);

    if(npc.gold) {
      const gold = await ItemCreator.getItemByName('Gold Coin');
      gold.value = npc.gold;
      allItems.push(gold);
    }

    this.createCorpse(npc, allItems);
  }

  async createCorpse(target: Character, searchItems) {
    const corpse = await ItemCreator.getItemByName('Corpse');
    corpse.sprite = target.sprite + 4;
    corpse.searchItems = searchItems;
    corpse.desc = `the corpse of a ${target.name}`;

    this.addItemToGround(target, corpse);

    target.$$corpseRef = corpse;
  }

  dropCorpseItems(corpse: Item, searcher?: Player) {
    if(!corpse.searchItems) return;

    corpse.searchItems.forEach(item => {
      if(searcher && item.itemClass === 'Coin') {
        searcher.addGold(item.value);
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
}
