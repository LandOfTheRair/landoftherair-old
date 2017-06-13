
import { omitBy, startsWith, isString, isObject, cloneDeep, sample } from 'lodash';

import { Parser } from 'mingy';

import { species } from 'fantastical';

import { Room } from 'colyseus';
import { GameState, MapLayer } from '../../models/gamestate';

import { DB } from '../database';
import { Player } from '../../models/player';

import { CommandExecutor } from '../helpers/command-executor';
import { NPC } from '../../models/npc';
import { Logger } from '../logger';
import { Spawner } from '../base/spawner';

const TickRates = {
  PlayerAction: 60,
  PlayerSave: 360
};

export class GameWorld extends Room<GameState> {

  private allMapNames;

  private spawners: Spawner[] = [];

  ticks = {
    Player: 0
  };

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
    if(player.$doNotSave) return;

    if(player._id) {
      delete player._id;
    }

    player = omitBy(player, (value, key) => {
      if(startsWith(key, '$')) return true;
      if(!Object.getOwnPropertyDescriptor(player, key)) return true;
      return false;
    });

    return DB.$players.update({ username: player.username, charSlot: player.charSlot }, { $set: player });
  }

  sendClientLogMessage(client, messageData) {

    let overMessage = messageData;
    let overName = '';

    if(isObject(messageData)) {
      const { message, name } = messageData;
      overMessage = message;
      overName = name;
    }

    this.send(client, { action: 'log_message', name: overName, message: overMessage });
  }

  showGroundWindow(client) {
    this.send(client, { action: 'show_ground' });
  }

  teleport(client, player, { newMap, x, y }) {
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
      player.$doNotSave = true;
      this.send(client, { action: 'change_map', map: newMap });
    }
  }

  placeItemOnGround(player, item) {
    this.state.addItemToGround(player, item);
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
    this.state.addPlayer(player);
  }

  onLeave(client) {
    const player = this.state.findPlayer(client.username);
    this.savePlayer(player);
    this.state.removePlayer(client.username);
  }

  onMessage(client, data) {
    if(!data.command) return;
    const player = this.state.findPlayer(client.username);

    data.gameState = this.state;
    data.room = this;
    data.client = client;

    const wasSuccess = CommandExecutor.executeCommand(player, data.command, data);

    if(!wasSuccess) {
      this.sendClientLogMessage(client, `Command "${data.command}" is invalid. Try again.`);
      return;
    }
  }

  // TODO retrieve boss timers
  // TODO retrieve tied items
  onInit() {
    this.loadNPCsFromMap();
    this.loadSpawners();
  }

  // TODO store boss timers
  // TODO store tied items (or maybe whole ground state?)
  onDispose() {

  }

  loadNPCsFromMap() {
    const npcs = this.state.map.layers[MapLayer.NPCs].objects;

    npcs.forEach(npcData => {
      const data = npcData.properties;
      data.name = npcData.name;
      data.sprite = npcData.gid - this.state.map.tilesets[3].firstgid;
      data.x = npcData.x / 64;
      data.y = npcData.y / 64;
      const npc = new NPC(data);

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
      const diffY = target.y - player.y - 1;

      if(!player.$fov[diffX]) return false;
      if(!player.$fov[diffX][diffY]) return false;

      return target.uuid = findStr || startsWith(target.name, findStr);
    });

    return possTargets;
  }

  tick() {
    this.ticks.Player++;

    // tick players every second or so
    if(this.ticks.Player % TickRates.PlayerAction === 0) {
      this.state.tickPlayers();
    }

    // save players every minute or so
    if(this.ticks.Player % TickRates.PlayerSave === 0) {
      this.state.players.forEach(player => this.savePlayer(player));
    }
  }
}
