
import { extend } from 'lodash';

import { Player } from './player';

export class ClientGameState {
  players: Player[] = [];
  map: any = {};
  mapName: string = '';

  constructor(opts) {
    extend(this, opts);
  }
}
