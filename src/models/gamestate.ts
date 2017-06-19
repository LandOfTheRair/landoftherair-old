
import { reject, extend, find, pull } from 'lodash';

import { Player } from './player';

import * as Mrpas from 'mrpas';
import { Item } from './item';
import { NPC } from './npc';

export const MapLayer = {
  Terrain: 0,
  Floors: 1,
  Fluids: 2,
  Foliage: 3,
  Walls: 4,
  Decor: 5,
  DenseDecor: 6,
  OpaqueDecor: 7,
  Interactables: 8,
  NPCs: 9,
  Spawners: 10
};

export class GameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';
  mapData: any = { openDoors: {} };
  mapNPCs: NPC[] = [];

  groundItems: any = {};

  fov: Mrpas;

  addNPC(npc: NPC) {
    npc.$map = this.map;
    this.mapNPCs.push(npc);
  }

  findNPC(uuid: string) {
    return find(this.mapNPCs, { uuid });
  }

  removeNPC(npc: NPC) {
    pull(this.mapNPCs, npc);
  }

  addPlayer(player) {
    player.$map = this.map;
    this.players.push(player);
    this.resetPlayerStatus(player);
  }

  findPlayer(username) {
    return find(this.players, { username });
  }

  removePlayer(username) {
    this.players = reject(this.players, p => p.username === username);
  }

  calculateFOV(player) {
    const affected = {};

    this.fov.compute(player.x, player.y, 4, (x, y) => {
      return affected[x - player.x] && affected[x - player.x][y - player.y];
    }, (x, y) => {
      affected[x - player.x] = affected[x - player.x] || {};
      affected[x - player.x][y - player.y] = true;
    });

    player.$fov = affected;
  }

  getPlayersInRange(x, y, radius) {
    return reject(this.players, p => {
      return p.x < radius-x
          || p.x > radius+x
          || p.y < radius-y
          || p.y > radius+y;
    });
  }

  resetPlayerStatus(player: Player) {
    this.calculateFOV(player);

    const swimTile = this.map.layers[MapLayer.Fluids].data[(player.y * this.map.width) + player.x];
    player.swimLevel = swimTile ? 1 : 0;
  }

  toggleDoor(door) {
    door.isOpen = !door.isOpen;
    door.opacity = !door.isOpen;
    door.density = !door.isOpen;

    this.mapData.openDoors[door.id] = { isOpen: door.isOpen, baseGid: door.gid, x: door.x, y: door.y-64 };
  }

  isItemValueStackable(item: Item) {
    return item.itemClass === 'Coin';
  }

  addItemToGround({ x, y }, item: Item) {
    if(!item) return;

    item.x = x;
    item.y = y;

    this.groundItems[x] = this.groundItems[x] || {};
    this.groundItems[x][y] = this.groundItems[x][y] || {};
    this.groundItems[x][y][item.itemClass] = this.groundItems[x][y][item.itemClass] || [];

    const typeList = this.groundItems[x][y][item.itemClass];

    if(this.isItemValueStackable(item) && typeList[0]) {
      typeList[0].value += item.value;
    } else {
      typeList.push(item);
    }
  }

  removeItemFromGround(item: Item) {
    const ground = this.getGroundItems(item.x, item.y)[item.itemClass];
    pull(ground, item);
    delete item.x;
    delete item.y;
  }

  getGroundItems(x, y) {
    if(!this.groundItems[x]) return {};
    if(!this.groundItems[x][y]) return {};
    return this.groundItems[x][y];
  }

  tickPlayers() {
    this.players.forEach(p => p.tick());
  }

  constructor(opts) {
    extend(this, opts);

    const denseLayer = this.map.layers[MapLayer.Walls].data;
    const opaqueObjects = this.map.layers[MapLayer.OpaqueDecor].objects;
    opaqueObjects.forEach(obj => obj.opacity = 1);

    const denseObjects = this.map.layers[MapLayer.DenseDecor].objects;
    denseObjects.forEach(obj => obj.density = 1);

    const interactables = this.map.layers[MapLayer.Interactables].objects;
    interactables.forEach(obj => {
      if(obj.type === 'Door') {
        obj.opacity = 1;
        obj.density = 1;
      }
    });

    const checkObjects = opaqueObjects.concat(interactables);

    this.fov = new Mrpas(this.map.width, this.map.height, (x, y) => {
      const tile = denseLayer[(y * this.map.width) + x];
      if(tile === 0) {
        const object = find(checkObjects, { x: x*64, y: (y+1)*64 });
        return !object || (object && !object.opacity);
      }
      return false;
    });
  }

  get maxSkill() {
    return this.map.properties.maxSkill;
  }

  toJSON() {
    return {
      map: this.map,
      mapData: this.mapData,
      mapName: this.mapName,
      mapNPCs: this.mapNPCs,
      players: this.players,
      groundItems: this.groundItems
    }
  }
}
