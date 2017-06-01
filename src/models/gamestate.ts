
import { reject, extend, find } from 'lodash';

import { Player } from './player';

export class GameState {
  players: Player[] = [];
  map: any = {};

  addPlayer(player) {
    this.players.push(player);
  }

  findPlayer(username) {
    return find(this.players, { username });
  }

  removePlayer(username) {
    this.players = reject(this.players, p => p.username === username);
  }

  constructor(opts) {
    extend(this, opts);
  }

  toJSON() {
    return {
      map: this.map,
      players: this.players
    }
  }
}
