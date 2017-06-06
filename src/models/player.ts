
import { omit, merge, find } from 'lodash';
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
  hpregen = 1;
  mpregen = 0;
}

export class Character {

  _id?: any;

  username: string;
  charSlot: number;
  isGM: boolean;

  name: string;

  hp: RestrictedNumber = new RestrictedNumber(0, 100, 100);
  mp: RestrictedNumber = new RestrictedNumber(0, 0, 0);
  xp: number = 1000;

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
  swimLevel: number;

  get ageString() {
    return 'extremely young';
  }

  get level() {
    return Math.floor(this.xp / 1000);
  }

  getTotalStat(stat) {
    return this.stats[stat];
  }

  constructor(opts) {
    merge(this, opts);
    this.hp = new RestrictedNumber(this.hp.minimum, this.hp.maximum, this.hp.__current);
    this.mp = new RestrictedNumber(this.mp.minimum, this.mp.maximum, this.mp.__current);
  }

  toJSON() {
    return omit(this, ['_id', 'charSlot']);
  }

  tick() {
    const hpRegen = this.getTotalStat('hpregen');
    const mpRegen = this.getTotalStat('mpregen');

    this.hp.add(hpRegen);
    this.mp.add(mpRegen);

    if(this.swimLevel > 0) {
      const hpPercentLost = this.swimLevel * 4;
      const hpLost = Math.floor(this.hp.maximum * (hpPercentLost/100));
      this.hp.sub(hpLost);
    }
  }
}

export class Player extends Character {
}
