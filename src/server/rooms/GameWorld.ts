
import { omitBy, startsWith, isString } from 'lodash';

import { Room } from 'colyseus';
import { GameState } from '../../models/gamestate';

import { DB } from '../database';
import { Player } from '../../models/player';

import { CommandExecutor } from '../helpers/command-executor';

const TickRates = {
  Player: 50
};

export class GameWorld extends Room<GameState> {

  ticks = {
    Player: 0
  };

  constructor(opts) {
    super(opts);

    this.setPatchRate(1000 / 20);
    this.setSimulationInterval(this.tick.bind(this), 1000 / 60);
    this.setState(new GameState({
      players: [],
      map: require(opts.mapPath),
      mapName: opts.mapName
    }));

    this.onInit();
  }

  savePlayer(player: Player) {
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

  // TODO check if player is in this map, return false if not - also, modify this to take a promise? - also fail if in game already
  requestJoin(opts) {
    // console.log('req', opts);
    return true;
  }

  async onJoin(client, options) {
    const playerData = await DB.$players.findOne({ username: client.username, map: this.state.mapName, charSlot: options.charSlot });
    if(!playerData) {
      return false;
    }

    const player = new Player(playerData);
    this.state.addPlayer(player);
  }

  onLeave(client) {
    this.savePlayer(this.state.findPlayer(client.username));
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
  onInit() {

  }

  // TODO store boss timers
  onDispose() {

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
