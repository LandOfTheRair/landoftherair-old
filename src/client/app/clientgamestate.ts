
import { extend, remove, find } from 'lodash';

import { Player } from '../../models/player';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { NPC } from '../../models/npc';
import { Item } from '../../models/item';

export class ClientGameState {
  players: Player[] = [];
  map: any = {};
  mapName = '';
  mapData: any = { openDoors: {} };
  mapNPCs: NPC[] = [];
  fov: any = {};

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

  constructor(opts) {
    extend(this, opts);
    this.initFOV();
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

  addPlayer(playerRef) {
    const player = new Player(playerRef);
    this.players.push(player);
    this.createPlayer$.next(player);
  }

  findPlayer(username) {
    return find(this.players, { username });
  }

  _updatePlayerAtIndex(playerIndex) {
    this.updatePlayer$.next(this.players[playerIndex]);
  }

  updatePlayerEffect(playerIndex, effectIndex, effect) {
    this.players[playerIndex].effects[effectIndex] = effect;
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

  removePlayer(playerIndex) {
    const player = this.players[playerIndex];
    this.removePlayer$.next(player);

    remove(this.players, (p, i) => i === playerIndex);
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
