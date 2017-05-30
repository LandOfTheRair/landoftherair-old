
import { Room } from 'colyseus';
import { GameState } from '../../models/gamestate';

export class GameWorld extends Room<GameState> {

  constructor(opts) {
    super(opts);

    this.setPatchRate(1000 / 20);
    this.setSimulationInterval(this.tick.bind(this), 1000 / 60);
    this.setState({ players: [], map: require(`../maps/${this.constructor.name}.json`) });
  }

  onDispose() {

  }

  onJoin(client, options) {
    console.log('join', client);
  }

  onLeave(client) {
    console.log('leave', client)
  }

  onMessage(client, data) {
    console.log('msg', client, data);
  }

  tick() {

  }
}
