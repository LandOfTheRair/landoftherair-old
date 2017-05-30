
import { extend } from 'lodash';

export class Account {
  _id?: any;

  createdAt: number;
  userId: string;
  username: string;
  characterNames: string[] = [];
  maxCharacters: number = 4;

  constructor(opts) {
    extend(this, opts);
  }

  toJSON() {
    return {
      username: this.username
    };
  }
}
