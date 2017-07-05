
import { extend } from 'lodash';

export class Account {
  _id?: any;

  createdAt: number;
  userId: string;
  username: string;
  characterNames: string[] = [];
  maxCharacters = 4;

  isGM = false;
  inGame = -1;

  constructor(opts) {
    extend(this, opts);
  }

  toJSON() {
    return {
      username: this.username,
      inGame: this.inGame,
      isGM: this.isGM
    };
  }
}
