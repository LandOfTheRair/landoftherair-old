
import { extend, remove, find } from 'lodash';

import { Player } from './player';

import { BehaviorSubject, Subject } from 'rxjs';

export class ClientGameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';

  createPlayer$ = new Subject<Player>();
  updatePlayer$ = new Subject<Player>();
  removePlayer$ = new Subject<Player>();

  setMap$ = new BehaviorSubject({});

  constructor(opts) {
    extend(this, opts);
  }

  setMap(map) {
    this.map = map;
    this.setMap$.next(map);
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
