
import { extend, remove, find, differenceBy, compact, values } from 'lodash';

import { Player } from '../../shared/models/player';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { NPC } from '../../shared/models/npc';
import { Item } from '../../shared/models/item';
import { Character } from '../../shared/models/character';

export class ClientGameState {
  private playerHash: { [key: string]: Player } = {};
  map: any = {};
  mapName = '';
  mapData: any = { openDoors: {} };
  mapNPCs: NPC[] = [];
  fov: any = {};
  darkness: any = {};

  _activeTarget: Character;

  groundItems: any = {};

  logMessages: string[] = [];

  fovArray = Array(9).fill(null).map((x, i) => i - 4);

  createPlayer$ = new Subject<Player>();
  updatePlayer$ = new Subject<Player>();
  removePlayer$ = new Subject<Player>();
  playerBoxes$  = new Subject<Player>();

  loadPlayer$   = new Subject<any>();

  updateGround$ = new BehaviorSubject({});

  setMap$ = new BehaviorSubject({});

  updates = {
    openDoors: []
  };

  environmentalObjects: any[] = [];

  get players() {
    return values(this.playerHash);
  }

  get allCharacters(): Character[] {
    return (<Character[]>this.mapNPCs).concat(this.players);
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

  grabOldUpdates(mapData) {
    Object.keys(mapData.openDoors).forEach(doorId => {
      if(!mapData.openDoors[doorId].isOpen) return;
      this.updates.openDoors.push(doorId);
    });
  }

  setMap(map) {
    this.map = map;
    this.setMap$.next(map);
  }

  setMapData(data) {
    this.mapData = data;
  }

  setMapNPCs(data) {
    this.mapNPCs = data.map(npc => new Character(npc));
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

  updatePlayerEffect(playerIndex, effectIndex, effect) {
    this.playerHash[playerIndex].effects[effectIndex] = effect;
    this.playerHash[playerIndex].effects = compact(this.playerHash[playerIndex].effects);
    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayerStealth(playerIndex, stealth) {
    (<any>this.playerHash[playerIndex]).totalStats.stealth = stealth;
    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayerPerception(playerIndex, perception) {
    (<any>this.playerHash[playerIndex]).totalStats.perception = perception;
    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayerEffectDuration(playerIndex, effectIndex, duration) {
    if(!this.playerHash[playerIndex].effects[effectIndex]) return;
    this.playerHash[playerIndex].effects[effectIndex].duration = duration;
    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayer(playerIndex, attr, val) {
    this.playerHash[playerIndex][attr] = val;
    this._updatePlayerAtIndex(playerIndex);
  }

  private __updatePlayerAttribute(playerIndex, attr, key, val) {
    this.playerHash[playerIndex][attr][key] = val;
  }

  updatePlayerAgro(playerIndex, attr, val) {
    this.__updatePlayerAttribute(playerIndex, 'agro', attr, val);
  }

  updatePlayerHP(playerIndex, key, val) {
    this.__updatePlayerAttribute(playerIndex, 'hp', key, val);
  }

  updatePlayerHand(playerIndex, hand, item) {
    this.playerHash[playerIndex][hand] = item;
  }

  updatePlayerGearItem(playerIndex, slot, item) {
    this.__updatePlayerAttribute(playerIndex, 'gear', slot, item);
  }

  updatePlayerHandItem(playerIndex, hand, attr, value) {
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
  }
}
