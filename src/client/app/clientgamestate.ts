
import { extend, remove, find, differenceBy, compact } from 'lodash';

import { Player } from '../../models/player';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { NPC } from '../../models/npc';
import { Item } from '../../models/item';
import { Character } from '../../models/character';

export class ClientGameState {
  players: Player[] = [];
  map: any = {};
  mapName = '';
  mapData: any = { openDoors: {} };
  mapNPCs: NPC[] = [];
  fov: any = {};

  _activeTarget: Character;

  groundItems: any = {};

  logMessages: string[] = [];

  fovArray = Array(9).fill(null).map((x, i) => i - 4);

  createPlayer$ = new Subject<Player>();
  updatePlayer$ = new Subject<Player>();
  removePlayer$ = new Subject<Player>();
  playerBoxes$  = new Subject<Player>();

  loadPlayer$   = new Subject<any>();

  setMap$ = new BehaviorSubject({});

  updates = {
    openDoors: []
  };

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
    Object.keys(mapData.openDoors).forEach(doorId => this.updates.openDoors.push(doorId));
  }

  setMap(map) {
    this.map = map;
    this.setMap$.next(map);
  }

  setMapData(data) {
    this.mapData = data;
  }

  setMapNPCs(data) {
    this.mapNPCs = data;
  }

  setGroundItems(data) {
    this.groundItems = data;
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
    const addPlayers = differenceBy(players, this.players, 'username');
    const delPlayers = differenceBy(this.players, players, 'username');

    if(addPlayers.length > 0 || delPlayers.length > 0) {
      this.players = players.map(x => new Player(x));
    }

    addPlayers.forEach(p => this.addPlayer(p));
    delPlayers.forEach(p => this.removePlayer(p));
  }

  addPlayer(playerRef) {
    const player = new Player(playerRef);
    this.createPlayer$.next(player);
  }

  removePlayer(playerRef) {
    const player = new Player(playerRef);
    this.removePlayer$.next(player);
  }

  findPlayer(username) {
    return find(this.players, { username });
  }

  _updatePlayerAtIndex(playerIndex) {
    this.updatePlayer$.next(this.players[playerIndex]);
  }

  updatePlayerEffect(playerIndex, effectIndex, effect) {
    this.players[playerIndex].effects[effectIndex] = effect;
    this.players[playerIndex].effects = compact(this.players[playerIndex].effects);
    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayerEffectDuration(playerIndex, effectIndex, duration) {
    this.players[playerIndex].effects[effectIndex].duration = duration;
    this._updatePlayerAtIndex(playerIndex);
  }

  updatePlayer(playerIndex, attr, val) {
    this.players[playerIndex][attr] = val;
    this._updatePlayerAtIndex(playerIndex);
  }

  private __updatePlayerAttribute(playerIndex, attr, key, val) {
    this.players[playerIndex][attr][key] = val;
  }

  updatePlayerAgro(playerIndex, attr, val) {
    this.__updatePlayerAttribute(playerIndex, 'agro', attr, val);
  }

  updatePlayerHP(playerIndex, key, val) {
    this.__updatePlayerAttribute(playerIndex, 'hp', key, val);
  }

  updatePlayerHand(playerIndex, hand, item) {
    this.players[playerIndex][hand] = item;
  }

  updatePlayerGearItem(playerIndex, slot, item) {
    this.__updatePlayerAttribute(playerIndex, 'gear', slot, item);
  }

  updatePlayerHandItem(playerIndex, hand, attr, value) {
    this.players[playerIndex][hand] = this.players[playerIndex][hand] || {};
    this.__updatePlayerAttribute(playerIndex, hand, attr, value);

    // this is bad, but this function is only called when hand swapping happens and there's an item in both hands, so whatever
    this.players[playerIndex][hand] = new Item(this.players[playerIndex][hand]);
  }

  removeAllPlayers() {
    this.players.forEach((p) => {
      this.removePlayer$.next(p);
    });

    this.players = [];
  }

  addLogMessage(message) {
    this.logMessages.push(message);

    if(this.logMessages.length > 500) this.logMessages.shift();
  }

  reset() {
    this.logMessages = [];
  }
}
