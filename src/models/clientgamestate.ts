
import { EventEmitter } from '@angular/core';

import { extend, reject } from 'lodash';

import { Player } from './player';

export class ClientGameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';

  updateMyPlayer = new EventEmitter();

  constructor(opts) {
    extend(this, opts);
  }

  addPlayer(player) {
    this.players.push(new Player(player));
  }

  removePlayer(player) {
    this.players = reject(this.players, p => p.username === player.username);
  }
}
