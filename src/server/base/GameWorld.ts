
import { Room } from 'colyseus';
import { GameState } from '../../models/gamestate';

import { DB } from '../database';
import { Player } from '../../models/player';

import { CommandExecutor } from '../helpers/command-executor';

export class GameWorld extends Room<GameState> {

  constructor(opts) {
    super(opts);

    this.setPatchRate(1000 / 20);
    this.setSimulationInterval(this.tick.bind(this), 1000 / 60);
    this.setState(new GameState({
      players: [],
      map: require(`../maps/${this.constructor.name}.json`),
      mapName: this.constructor.name
    }));

    this.onInit();
  }

  savePlayer(player: Player) {
    if(player._id) {
      delete player._id;
    }

    return DB.$players.update({ username: player.username, charSlot: player.charSlot }, { $set: player });
  }

  // TODO check if player is in this map, return false if not - also, modify this to take a promise? - also fail if in game already
  requestJoin(opts) {
    // console.log('req', opts);
    return true;
  }

  async onJoin(client, options) {
    const playerData = await DB.$players.findOne({ username: client.username, map: this.constructor.name, charSlot: options.charSlot });
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
    const player = this.state.findPlayer(client.username);

    data.gameState = this.state;
    data.room = this;
    data.client = client;

    const wasSuccess = CommandExecutor.executeCommand(player, data.command, data);

    if(!wasSuccess) {
      // TODO emit "invalid command, try again"
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
  }
}
