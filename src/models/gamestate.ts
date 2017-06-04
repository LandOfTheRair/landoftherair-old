
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
    const opaqueObjects = this.map.layers[7].objects;

    this.fov = new Mrpas(this.map.width, this.map.height, (x, y) => {
      const tile = denseLayer[(y * this.map.width) + x];
      if(tile === 0) {
        const object = find(opaqueObjects, { x: x*64, y: (y+1)*64 });
        return !object;
      }
      return false;
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
