
import { extend, remove, find, differenceBy, compact, values, map } from 'lodash';

import { Player } from '../../shared/models/player';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { NPC } from '../../shared/models/npc';
import { Item } from '../../shared/models/item';
import { Character } from '../../shared/models/character';

export class ClientGameState {
  fovArray = Array(9).fill(null).map((x, i) => i - 4);

  currentPlayer: any;

  private playerHash: { [key: string]: Player } = {};
  map: any = {};
  mapName = '';
  mapData: any = { openDoors: {} };
  mapNPCs: { [key: string]: NPC } = {};
  fov: any = {};
  darkness: any = {};

  _activeTarget: Character;

  groundItems: any = {};

  logMessages: string[] = [];

  environmentalObjects: any[] = [];

  updates = {
    openDoors: []
  };

  createPlayer$ = new Subject<Player>();
  updatePlayer$ = new Subject<Player>();
  removePlayer$ = new Subject<Player>();
  playerBoxes$  = new Subject<{ newPlayer: Player, oldPlayer: Player }>();

  loadPlayer$   = new Subject<any>();

  updateGround$ = new BehaviorSubject({});

  setMap$ = new BehaviorSubject({});

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
    this.setMap$.next(map);
  }

  setMapData(data) {
    this.mapData = data;
  }

  setMapNPCs(data) {
    Object.keys(data).forEach(uuid => data[uuid] = new Character(data[uuid]));
    this.mapNPCs = data;
  }

  setGroundItems(data) {
    this.groundItems = data;
    this.updateGround$.next(data || {});
  }

  setEnvironmentalObjects(data) {
    this.environmentalObjects = data;
  }

  setDarkness(data) {
    this.darkness = data;
  }

  initFOV(fov?) {
    for(let x = -4; x <= 4; x++) {
      this.fov[x] = this.fov[x] || {};

      for(let y = -4; y <= 4; y++) {
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

    addPlayers.forEach(p => this.addPlayer(this.playerHash[p]));
    delPlayers.forEach(p => this.removePlayer(this.playerHash[p]));
  }

  private addPlayer(player: Player) {
    this.createPlayer$.next(player);
  }

  private removePlayer(player: Player) {
    delete this.playerHash[player.username];
    this.removePlayer$.next(player);
  }

  findPlayer(username) {
    return this.playerHash[username];
  }

  private _updatePlayerAtIndex(playerIndex) {
    this.updatePlayer$.next(this.playerHash[playerIndex]);
  }

  updatePlayerEffect(change) {
    const playerIndex = change.path.id;
    const effectIndex = change.path.effect;
    const attr = change.path.attr;
    const effect = change.value;

    if(!this.playerHash[playerIndex]) return;

    const effectRef = this.playerHash[playerIndex].effects;

    if(change.operation === 'remove') {
      effectRef[effectIndex] = null;
      this.playerHash[playerIndex].effects = compact(effectRef);
      return;
    }

    if(change.operation === 'add') {
      effectRef[effectIndex] = effectRef[effectIndex] || (<any>{});
      effectRef[effectIndex][attr] = effect;
    }

    if(change.operation === 'replace' && effectRef[effectIndex]) {
      effectRef[effectIndex][attr] = effect;
      if(effectRef[effectIndex].duration <= 0 && !effectRef[effectIndex].effectInfo.isPermanent) {
        effectRef[effectIndex] = null;
        this.playerHash[playerIndex].effects = compact(effectRef);
      }
    }

    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayerStealth(playerIndex, stealth) {
    if(!this.playerHash[playerIndex]) return;
    (<any>this.playerHash[playerIndex]).totalStats.stealth = stealth;
    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayerPerception(playerIndex, perception) {
    if(!this.playerHash[playerIndex]) return;
    (<any>this.playerHash[playerIndex]).totalStats.perception = perception;
    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayer(playerIndex, attr, val) {
    if(!this.playerHash[playerIndex]) return;
    this.playerHash[playerIndex][attr] = val;
    this._updatePlayerAtIndex(playerIndex);
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
    values(this.playerHash).forEach((p) => {
      this.removePlayer$.next(p);
    });

    this.playerHash = {};
  }

  addLogMessage(message) {
    this.logMessages.push(message);

    if(this.logMessages.length > 500) this.logMessages.shift();
  }

  reset() {
    this.logMessages = [];
    this.playerHash = {};
    this.map = {};
    this.mapName = '';
    this.mapData = { openDoors: {} };
    this.fov = {};
    this.darkness = {};
    this._activeTarget = null;
    this.groundItems = {};
    this.environmentalObjects = [];
    this.updates = { openDoors: [] };
    this.currentPlayer = null;
  }
}
