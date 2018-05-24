
import { extend, merge, differenceBy, values, filter, reject, size, get, set } from 'lodash';

import { Player } from '../../shared/models/player';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { Item } from '../../shared/models/item';
import { Character } from '../../shared/models/character';
import { MapLayer } from '../../shared/models/maplayer';
import { LootHelper } from '../../server/helpers/world/loot-helper';
import { SkillTree } from '../../shared/models/skill-tree';

export class ClientGameState {
  fovArray = Array(9).fill(null).map((x, i) => i - 4);

  _currentPlayer: Player;

  public set currentPlayer(player: Player) {
    this._currentPlayer = player;
  }

  public get currentPlayer() {
    return this._currentPlayer;
  }

  private playerHash: { [key: string]: Player } = {};
  map: any = {};
  mapName = '';
  mapData: any = { openDoors: {} };
  mapNPCs: { [key: string]: Character } = {};
  fov: any = {};
  darkness: any = {};
  secretWallHash: any = {};

  _activeTarget: Character;

  groundItems: any = {};

  public logMessages$ = new Subject<any>();
  public skillTree$ = new BehaviorSubject<SkillTree>(new SkillTree({}));

  environmentalObjects: any[] = [];

  updates = {
    openDoors: []
  };

  playerBoxes$  = new Subject<{ newPlayer: Player, oldPlayer: Player }>();

  loadPlayer$   = new Subject<any>();

  updateGround$ = new BehaviorSubject({});

  setMap$ = new BehaviorSubject({});

  public hasLoadedMeInNewMap: boolean;

  get players() {
    return values(this.playerHash);
  }

  get allCharacters(): Character[] {
    return (<Character[]>values(this.mapNPCs)).concat(this.players);
  }

  get activeTarget() {
    return this._activeTarget;
  }

  set activeTarget(target) {
    this._activeTarget = target;
  }

  constructor(opts) {
    extend(this, opts);
    this.initFOV();
  }

  modifyDoor(doorChange) {
    this.updates.openDoors.push(doorChange.path.id);
  }

  grabOldUpdates(mapData) {
    Object.keys(mapData.openDoors).forEach(doorId => {
      if(!mapData.openDoors[doorId].isOpen) return;
      this.updates.openDoors.push(doorId);
    });
  }

  setPlayer(player: Player) {
    this.currentPlayer = player;
  }

  setMap(map) {
    this.map = map;
    this.findSecretWalls();
    this.setMap$.next(map);
  }

  setNPCVolatile(npcVolatile) {
    Object.keys(npcVolatile).forEach(npcUUID => {
      if(!this.mapNPCs[npcUUID]) return;
      merge(this.mapNPCs[npcUUID], npcVolatile[npcUUID]);
      this.mapNPCs[npcUUID].effects = npcVolatile[npcUUID].effects;

      const newStealth = get(npcVolatile[npcUUID], 'totalStats.stealth', 0);
      set(this.mapNPCs[npcUUID], 'totalStats.stealth', newStealth);
    });
  }

  private findSecretWalls() {
    const allPossibleLayers = this.map.layers[MapLayer.OpaqueDecor].objects;
    const secretWalls = filter(allPossibleLayers, { type: 'SecretWall' });
    secretWalls.forEach(({ x, y }) => {
      this.secretWallHash[x / 64] = this.secretWallHash[x / 64] || {};
      this.secretWallHash[x / 64][(y / 64) - 1] = true;
    });
  }

  setMapData(data) {
    this.mapData = data;
  }

  addNPC(npc) {
    this.mapNPCs[npc.uuid] = new Character(npc);
  }

  removeNPC(npcUUID: string) {
    delete this.mapNPCs[npcUUID];
  }

  setMapNPCs(data) {
    Object.keys(data).forEach(uuid => data[uuid] = new Character(data[uuid]));
    this.mapNPCs = data;
  }

  addGroundItem(x: number, y: number, item: Item) {
    const xKey = `x${x}`;
    const yKey = `y${y}`;

    this.groundItems[xKey] = this.groundItems[xKey] || {};
    this.groundItems[xKey][yKey] = this.groundItems[xKey][yKey] || {};
    this.groundItems[xKey][yKey][item.itemClass] = this.groundItems[xKey][yKey][item.itemClass] || [];

    const typeList = this.groundItems[xKey][yKey][item.itemClass];

    if(LootHelper.isItemValueStackable(item) && typeList[0]) {
      typeList[0].value += item.value;
    } else {
      typeList.push(item);
    }

    this.updateGroundItems();
  }

  removeGroundItem(x: number, y: number, item: Item) {
    const xKey = `x${x}`;
    const yKey = `y${y}`;

    this.groundItems[xKey] = this.groundItems[xKey] || {};
    this.groundItems[xKey][yKey] = this.groundItems[xKey][yKey] || {};
    this.groundItems[xKey][yKey][item.itemClass] = this.groundItems[xKey][yKey][item.itemClass] || [];

    this.groundItems[xKey][yKey][item.itemClass] = reject(this.groundItems[xKey][yKey][item.itemClass], (i: Item) => i.uuid === item.uuid);

    if(size(this.groundItems[xKey][yKey][item.itemClass]) === 0) delete this.groundItems[xKey][yKey][item.itemClass];
    if(size(this.groundItems[xKey][yKey]) === 0) delete this.groundItems[xKey][yKey];
    if(size(this.groundItems[xKey]) === 0) delete this.groundItems[xKey];

    this.updateGroundItems();
  }

  setGroundItems(data) {
    this.groundItems = data;
    this.updateGroundItems();
  }

  private updateGroundItems() {
    this.updateGround$.next(this.groundItems || {});
  }

  setEnvironmentalObjects(data) {
    this.environmentalObjects = data;
  }

  setDarkness(data) {
    this.darkness = data;
  }

  initFOV(fov?) {
    for(let x = -5; x <= 5; x++) {
      this.fov[x] = this.fov[x] || {};

      for(let y = -5; y <= 5; y++) {
        this.fov[x][y] = !!(fov && fov[x] && fov[x][y]);
      }
    }
  }

  setFOV(fov) {
    this.initFOV(fov);
  }

  setPlayers(players) {
    const newList = Object.keys(players);
    const oldList = Object.keys(this.playerHash);

    const addPlayers = differenceBy(newList, oldList);
    const delPlayers = differenceBy(oldList, newList);

    if(addPlayers.length > 0 || delPlayers.length > 0) {
      newList.forEach(playerUsername => {
        this.playerHash[playerUsername] = new Player(players[playerUsername]);
      });
    }

    // addPlayers.forEach(p => this.addPlayer(this.playerHash[p]));
    delPlayers.forEach(p => this.removePlayer(this.playerHash[p]));
  }

  findPlayer(username) {
    return this.playerHash[username];
  }

  private removePlayer(player: Player) {
    delete this.playerHash[player.username];
  }

  updatePlayerStealth(playerIndex, stealth) {
    if(!this.playerHash[playerIndex]) return;
    (<any>this.playerHash[playerIndex]).totalStats.stealth = stealth;
  }

  updatePlayerPerception(playerIndex, perception) {
    if(!this.playerHash[playerIndex]) return;
    (<any>this.playerHash[playerIndex]).totalStats.perception = perception;
  }

  updatePlayer(playerIndex, attr, val) {
    if(!this.playerHash[playerIndex]) return;
    this.playerHash[playerIndex][attr] = val;
  }

  updatePlayerEffect(change) {
    const playerIndex = change.path.id;
    const effectIndex = change.path.effect;
    const attr = change.path.attr;
    const effect = change.value;

    if(!this.playerHash[playerIndex]) return;

    const effectRef = this.playerHash[playerIndex].effects;

    if(change.operation === 'remove') {
      delete effectRef[effectIndex];
      return;
    }

    if(change.operation === 'add') {
      effectRef[effectIndex] = effectRef[effectIndex] || (<any>{});
      effectRef[effectIndex][attr] = effect;
    }

    if(change.operation === 'replace' && effectRef[effectIndex]) {
      effectRef[effectIndex][attr] = effect;
      if(effectRef[effectIndex].duration <= 0 && !get(effectRef[effectIndex], 'effectInfo.isPermanent', false)) {
        delete effectRef[effectIndex];
      }
    }
  }

  private __updatePlayerAttribute(playerIndex, attr, key, val) {
    if(!this.playerHash[playerIndex]) return;
    this.playerHash[playerIndex][attr][key] = val;
  }

  updatePlayerAgro(playerIndex, attr, val) {
    this.__updatePlayerAttribute(playerIndex, 'agro', attr, val);
  }

  updatePlayerHP(playerIndex, key, val) {
    this.__updatePlayerAttribute(playerIndex, 'hp', key, val);
  }

  updatePlayerHand(playerIndex, hand, item) {
    if(!this.playerHash[playerIndex]) return;
    this.playerHash[playerIndex][hand] = item;
  }

  updatePlayerGearItem(playerIndex, slot, item) {
    if(!this.playerHash[playerIndex]) return;
    this.__updatePlayerAttribute(playerIndex, 'gear', slot, item);
  }

  updatePlayerHandItem(playerIndex, hand, attr, value) {
    if(!this.playerHash[playerIndex]) return;
    this.playerHash[playerIndex][hand] = this.playerHash[playerIndex][hand] || {};
    this.__updatePlayerAttribute(playerIndex, hand, attr, value);

    // this is bad, but this function is only called when hand swapping happens and there's an item in both hands, so whatever
    this.playerHash[playerIndex][hand] = new Item(this.playerHash[playerIndex][hand]);
  }

  removeAllPlayers() {
    this.playerHash = {};
  }

  addLogMessage(message) {
    message.message = this.formatMessage(message);

    this.logMessages$.next(message);
  }

  private formatMessage(message: any) {
    if(message.dirFrom && message.message.toLowerCase().startsWith('you hear')) {
      return message.message.substring(8);
    }
    return message.message;
  }

  reset() {
    this.map = {};
    this.mapName = '';
    this.updates = { openDoors: [] };
    this.currentPlayer = null;

    this.mapchangeReset();
  }

  mapchangeReset() {
    this.darkness = {};
    this.groundItems = {};
    this.updateGround$.next({});
    this.skillTree$.next(new SkillTree({}));
    this._activeTarget = null;
    this.mapNPCs = {};
    this.environmentalObjects = [];
    this.fov = {};
    this.mapData = { openDoors: {} };
    this.removeAllPlayers();
  }
}
