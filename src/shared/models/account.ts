
import { extend } from 'lodash';

export type Status = 'Available' | 'AFK';

export class Account {
  _id?: any;

  createdAt: number;
  userId: string;
  username: string;
  characterNames: string[] = [];
  maxCharacters = 4;

  isGM = false;
  inGame = -1;
  status: Status = 'Available';

  constructor(opts) {
    extend(this, opts);
  }

  toJSON() {
    return {
      username: this.username,
      status: this.status,
      inGame: this.inGame,
      isGM: this.isGM
    };
  }
}
