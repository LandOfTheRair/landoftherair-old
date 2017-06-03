
import { extend, remove, find } from 'lodash';

import { Player } from './player';

import { BehaviorSubject, Subject } from 'rxjs';

export class ClientGameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';
  fov: any = {};

  fovArray = Array(9).fill(null).map((x, i) => i - 4);

  createPlayer$ = new Subject<Player>();
  updatePlayer$ = new Subject<Player>();
  removePlayer$ = new Subject<Player>();

  setMap$ = new BehaviorSubject({});

  constructor(opts) {
    extend(this, opts);
    this.initFOV();
  }

  setMap(map) {
    this.map = map;
    this.setMap$.next(map);
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
    console.log(fov);
  }

  addPlayer(playerRef) {
    const player = new Player(playerRef);
    this.players.push(player);
    this.createPlayer$.next(player);
  }

  findPlayer(username) {
    return find(this.players, { username });
  }

  updatePlayer(playerIndex, attr, val) {
    this.players[playerIndex][attr] = val;
    this.updatePlayer$.next(this.players[playerIndex]);
  }

  removePlayer(playerIndex) {
    const player = this.players[playerIndex];
    this.removePlayer$.next(player);

    remove(this.players, (p, i) => i === playerIndex);
  }
}
