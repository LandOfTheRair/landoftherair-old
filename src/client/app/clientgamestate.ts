
import { extend, remove, find } from 'lodash';

import { Player } from '../../models/player';

import { BehaviorSubject, Subject } from 'rxjs';

export class ClientGameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';
  mapData: any = { openDoors: {} };
  fov: any = {};

  logMessages: string[] = [];

  fovArray = Array(9).fill(null).map((x, i) => i - 4);

  createPlayer$ = new Subject<Player>();
  updatePlayer$ = new Subject<Player>();
  removePlayer$ = new Subject<Player>();
  playerBoxes$  = new Subject<Player>();

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

  updatePlayer(playerIndex, attr, val) {
    this.players[playerIndex][attr] = val;
    this.updatePlayer$.next(this.players[playerIndex]);
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
}
