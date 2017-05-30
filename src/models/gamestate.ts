
import { Player } from './player';

export class GameState {
  players: Player[] = [];
  map: any = {};

  toJSON() {
    return {
      map: this.map,
      players: this.players
    }
  }
}
