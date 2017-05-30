
import { omit, extend } from 'lodash';
import * as RestrictedNumber from 'restricted-number';

export type Allegiance =
  'None'
| 'Pirates'
| 'Townsfolk'
| 'Royalty'
| 'Adventurers'
| 'Wilderness'
| 'Underground'

export class Stats {
  str = 0;
  dex = 0;
  agi = 0;

  int = 0;
  wis = 0;
  wil = 0;

  luk = 0;
  cha = 0;
  con = 0;
}

export class Character {

  username: string;
  charSlot: number;

  hp: RestrictedNumber = new RestrictedNumber(0, 100, 100);
  mp: RestrictedNumber = new RestrictedNumber(0, 0, 0);
  xp: number = 0;

  gold: number = 0;

  stats: Stats = new Stats();

  allegiance: Allegiance = 'None';

  x: number;
  y: number;
  map: string;

  get level() {
    return Math.floor(this.xp / 1000);
  }

  constructor(opts) {
    extend(this, opts);
  }

  toJSON() {
    return omit(this, ['username', 'charSlot']);
  }
}

export class Player extends Character {

}
