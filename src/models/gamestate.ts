
import { reject, filter, extend, find, pull, size, pick, minBy, includes } from 'lodash';

import { Player } from './player';

import * as Mrpas from 'mrpas';
import { Item } from './item';
import { NPC } from './npc';
import { Character } from './character';
import { GetGidDescription, GetSwimLevel } from '../server/gidmetadata/descriptions';

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
  Spawners: 10,
  RegionDescriptions: 11
};

export class GameState {
  players: Player[] = [];
  map: any = {};
  mapName = '';
  mapData: any = { openDoors: {} };
  mapNPCs: NPC[] = [];

  groundItems: any = {};

  fov: Mrpas;

  addNPC(npc: NPC) {
    npc.$$map = this.map;
    this.mapNPCs.push(npc);
  }

  findNPC(uuid: string) {
    return find(this.mapNPCs, { uuid });
  }

  removeNPC(npc: NPC) {
    pull(this.mapNPCs, npc);
  }

  addPlayer(player) {
    player.$$map = this.map;
    this.players.push(player);
    this.resetPlayerStatus(player);
  }

  findPlayer(username) {
    return find(this.players, { username });
  }

  removePlayer(username) {
    this.players = reject(this.players, p => p.username === username);
  }

  resetFOV(player) {
    Object.keys(player.$fov).forEach(x => {
      Object.keys(player.$fov[x]).forEach(y => {
        player.$fov[x][y] = false;
      });
    });
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

  getPlayersInRange(x, y, radius, except = []) {
    return reject(this.players, p => {
      return p.x < x - radius
          || p.x > x + radius
          || p.y < y - radius
          || p.y > y + radius
          || includes(except, p.uuid);
    });
  }

  private checkTargetForHostility(me: NPC, target: Character): boolean {
    if(me.agro[target.uuid]) return true;
    if(me.allegianceReputation[target.allegiance] <= 0) return true;
    if(me.allegiance === target.allegiance) return false;
    if(me.hostility === 'Always') return true;
    if(me.alignment === 'Evil' && (target.alignment === 'Neutral' || target.alignment === 'Good')) return true;
    return false;
  }

  getPossibleTargetsFor(me: NPC, radius) {
    return filter((<any>this.players).concat(this.mapNPCs), char => {

      // no hitting myself
      if(me === char) return false;

      // no hitting dead people
      if(char.isDead()) return false;

      // if they can't attack, they're not worth fighting
      if(char.hostility === 'Never') return false;

      // they have to be visible
      const inRadius = char.x > me.x - radius
        && char.x < me.x + radius
        && char.y > me.y - radius
        && char.y < me.y + radius;

      if(!inRadius) return false;

      if(this.checkTargetForHostility(me, char)) return true;

      return false;
    });
  }

  resetPlayerStatus(player: Player, ignoreMessages = false) {
    this.calculateFOV(player);

    const mapLayers = this.map.layers;
    const playerOffset = (player.y * this.map.width) + player.x;

    const swimTile = mapLayers[MapLayer.Fluids].data[playerOffset];
    const swimInfo = GetSwimLevel(swimTile);
    if(swimInfo) {
      player.$$swimElement = swimInfo.element;
      player.swimLevel = swimInfo.swimLevel;
    } else {
      player.swimLevel = 0;
    }

    if(ignoreMessages) return;

    const regionObjs = filter(this.map.layers[MapLayer.RegionDescriptions].objects, reg => {
      const x = (reg.x / 64);
      const y = (reg.y / 64);
      const width = reg.width / 64;
      const height = reg.height / 64;
      return player.x >= x
          && player.x < x + width
          && player.y >= y
          && player.y < y + height;
    });


    const regionObj = minBy(regionObjs, 'width');
    let regionDesc = '';

    if(regionObj && regionObj.properties.desc) {
      regionDesc = regionObj.properties.desc;
    }

    const descObjs = this.map.layers[MapLayer.Interactables].objects.concat(this.map.layers[MapLayer.Decor].objects);
    const descObj = find(descObjs, { x: player.x * 64, y: (player.y + 1) * 64 });
    const intDesc = GetGidDescription(descObj ? descObj.gid : 0);

    const swimDesc = GetGidDescription(swimTile);
    const foliageDesc = mapLayers[MapLayer.Foliage].data[playerOffset] ? 'You are near some trees.' : '';
    const floorDesc = GetGidDescription(mapLayers[MapLayer.Floors].data[playerOffset]);
    const terrainDesc = GetGidDescription(mapLayers[MapLayer.Terrain].data[playerOffset]);

    const desc = intDesc || swimDesc || foliageDesc || floorDesc || terrainDesc;

    const hasNewRegion = regionDesc && regionDesc !== player.$$lastRegion;

    if(hasNewRegion) {
      player.$$lastRegion = regionDesc;
      player.sendClientMessage({ message: regionDesc, subClass: 'env' });

    } else if(!regionDesc) {
      player.$$lastRegion = '';

    }

    if(!hasNewRegion && desc !== player.$$lastDesc) {
      player.$$lastDesc = desc;
      player.sendClientMessage({ message: desc, subClass: 'env' });
    }
  }

  toggleDoor(door) {
    door.isOpen = !door.isOpen;
    door.opacity = !door.isOpen;
    door.density = !door.isOpen;

    this.mapData.openDoors[door.id] = { isOpen: door.isOpen, baseGid: door.gid, x: door.x, y: door.y - 64 };
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

    if(size(this.groundItems[item.x][item.y][item.itemClass]) === 0) delete this.groundItems[item.x][item.y][item.itemClass];
    if(size(this.groundItems[item.x][item.y]) === 0) delete this.groundItems[item.x][item.y];
    if(size(this.groundItems[item.x]) === 0) delete this.groundItems[item.x];

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
        const object = find(checkObjects, { x: x * 64, y: (y + 1) * 64 });
        return !object || (object && !object.opacity);
      }
      return false;
    });
  }

  get maxSkill() {
    return this.map.properties.maxSkill;
  }

  cleanNPCs() {
    return this.mapNPCs.map(npc => {
      const baseObj = pick(npc, [
        'agro', 'uuid', 'name',
        'hostility', 'alignment', 'allegiance', 'allegianceReputation',
        'dir', 'sprite',
        'leftHand', 'rightHand', 'gear.Armor', 'gear.Robe1', 'gear.Robe2',
        'hp',
        'x', 'y'
      ]);
      if(!baseObj.gear) baseObj.gear = {};
      return baseObj;
    });
  }

  toJSON() {
    return {
      mapData: this.mapData,
      mapName: this.mapName,
      mapNPCs: this.cleanNPCs(),
      players: this.players,
      groundItems: this.groundItems
    };
  }
}
