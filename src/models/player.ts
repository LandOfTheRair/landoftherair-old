
import { omit, merge } from 'lodash';
import * as RestrictedNumber from 'restricted-number';

export type Allegiance =
  'None'
| 'Pirates'
| 'Townsfolk'
| 'Royalty'
| 'Adventurers'
| 'Wilderness'
| 'Underground'

export type Sex = 'Male' | 'Female';

export type Direction = 'N' | 'S' | 'E' | 'W' | 'C';

export type CharacterClass =
  'Undecided';

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

  move = 3;
}

export class Character {

  _id?: any;

  username: string;
  charSlot: number;

  name: string;

  hp: RestrictedNumber = new RestrictedNumber(0, 100, 100);
  mp: RestrictedNumber = new RestrictedNumber(0, 0, 0);
  xp: number = 0;

  gold: number = 0;

  stats: Stats = new Stats();

  allegiance: Allegiance = 'None';
  sex: Sex = 'Male';
  dir: Direction = 'S';

  x: number = 0;
  y: number = 0;
  map: string;

  baseClass: CharacterClass = 'Undecided';

  $fov: any;

  get ageString() {
    return 'extremely young';
  }

  get level() {
    return Math.floor(this.xp / 1000);
  }

  constructor(opts) {
    merge(this, opts);
  }

  toJSON() {
    return omit(this, ['_id', 'charSlot']);
  }
}

export class Player extends Character {

}
