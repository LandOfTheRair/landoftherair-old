
import { reject, extend, find } from 'lodash';

import { Player } from './player';

import * as Mrpas from 'mrpas';

export const MapLayer = {
  Terrain: 0,
  Floors: 1,
  Fluids: 2,
  Foliage: 3,
  Walls: 4,
  Decor: 5,
  DenseDecor: 6,
  OpaqueDecor: 7,
  Interactables: 8
};

export class GameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';
  mapData: any = { openDoors: {} };

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

  toggleDoor(door) {
    door.isOpen = !door.isOpen;
    this.mapData.openDoors[door.id] = { isOpen: door.isOpen, baseGid: door.gid, x: door.x, y: door.y-64 };
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
      mapData: this.mapData,
      mapName: this.mapName,
      players: this.players
    }
  }
}
