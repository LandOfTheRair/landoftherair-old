
import { extend } from 'lodash';

export class Account {
  _id?: any;

  createdAt: number;
  userId: string;
  username: string;
  characterNames: string[] = [];
  maxCharacters = 4;

  isGM = false;

  constructor(opts) {
    extend(this, opts);
  }

  toJSON() {
    return {
      username: this.username,
      isGM: this.isGM
    };
  }
}
