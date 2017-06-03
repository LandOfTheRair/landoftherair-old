
import { reject, extend, find } from 'lodash';

import { Player } from './player';

import * as Mrpas from 'mrpas';

export class GameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';

  fov: Mrpas;

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

    const denseLayer = this.map.layers[4].data;

    this.fov = new Mrpas(this.map.width, this.map.height, (x, y) => {
      return !denseLayer[(y * this.map.width) + x];
    });
  }

  toJSON() {
    return {
      map: this.map,
      mapName: this.mapName,
      players: this.players
    }
  }
}
