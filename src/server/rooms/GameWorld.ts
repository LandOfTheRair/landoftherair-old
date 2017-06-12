
import { omitBy, startsWith, isString, cloneDeep, sample } from 'lodash';

import { species } from 'fantastical';

import { Room } from 'colyseus';
import { GameState, MapLayer } from '../../models/gamestate';

import { DB } from '../database';
import { Player } from '../../models/player';

import { CommandExecutor } from '../helpers/command-executor';
import { NPC } from '../../models/npc';

const TickRates = {
  Player: 50
};

export class GameWorld extends Room<GameState> {

  private allMapNames;

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

  sendClientLogMessage(client, message) {
    this.send(client, { action: 'log_message', message });
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

    if(newMap) {
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
      data.sprite = npcData.gid;
      data.x = npcData.x / 64;
      data.y = npcData.y / 64;
      const npc = new NPC(data);

      if(npc.script) {
        const { setup, responses } = require(`${__dirname}/../scripts/npc/${npc.script}`);
        setup(npc);
        responses(npc);
      }

      if(!npc.name) this.determineNPCName(npc);

      this.state.addNPC(npc);
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

  // TODO save every player every minute
  tick() {
    this.ticks.Player++;

    if(this.ticks.Player >= TickRates.Player) {
      this.ticks.Player = 0;
      this.state.tickPlayers();
    }
  }
}
