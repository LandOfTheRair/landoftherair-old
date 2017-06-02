
import { EventEmitter } from '@angular/core';

import { extend, remove, find } from 'lodash';

import { Player } from './player';

export class ClientGameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';

  createPlayer$ = new EventEmitter();
  updatePlayer$ = new EventEmitter();
  removePlayer$ = new EventEmitter();

  constructor(opts) {
    extend(this, opts);
  }

  addPlayer(playerRef) {
    const player = new Player(playerRef);
    this.players.push(player);
    this.createPlayer$.emit(player);
  }

  findPlayer(username) {
    return find(this.players, { username });
  }

  updatePlayer(playerIndex, attr, val) {
    this.players[playerIndex][attr] = val;
    this.updatePlayer$.emit(this.players[playerIndex]);
  }

  removePlayer(playerIndex) {
    const player = this.players[playerIndex];
    this.removePlayer$.emit(player);

    remove(this.players, (p, i) => i === playerIndex);
  }
}
