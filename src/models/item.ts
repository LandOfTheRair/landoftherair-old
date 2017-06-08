
import { extend, omitBy } from 'lodash';
import * as uuid from 'uuid/v4';
import { Player } from './player';

export const ValidItemTypes = [
  'Mace', 'Axe', 'Dagger', 'Magical', 'OneHandedSword', 'TwoHandedSword', 'Polearm', 'Ranged',
  'Martial', 'Staff', 'HealingMagic', 'ElementalMagic', 'Throwing', 'Thievery'
];

/* TODO Eventually:

  - items that have an xp value, xp max, level, value, level max, and stat growth per item level
  - items that can only grow by killing certain mobs
  - items that have stats that grow based on the player level
  - items that have random stats assigned to them
  - items that boost skills
 */

export class ItemRequirements {
  level?: number;
  class?: string[];
}

export class Item {
  name: string;
  desc: string;
  sprite: number;
  itemClass: string;

  uuid?: string;

  // username ref
  owner?: string;

  armorClass = 0;
  accuracy = 0;
  baseDamage = 5;

  value = 0;
  stats: any = {};
  requirements?: ItemRequirements;
  condition: number = 20000;
  type = 'Martial';

  isBeltable = false;
  isSackable = true;

  constructor(opts) {
    extend(this, opts);
    if(!this.uuid) this.uuid = uuid();
  }

  get conditionString() {
    if(this.condition <= 0)     return 'broken';
    if(this.condition <= 5000)  return 'tattered';
    if(this.condition <= 10000) return 'below average';
    if(this.condition <= 20000) return 'average';
    if(this.condition <= 30000) return 'above average';
    if(this.condition <= 40000) return 'mint';
    if(this.condition <= 50000) return 'above mint';
    return 'perfect';
  }

  descTextFor(player: Player) {
    let ownedText = '';
    if(this.owner) {
      if(this.owner === player.username) ownedText = 'This item belongs to you.';
      else                               ownedText = 'This item does not belong to you.';
    }
    return `You are looking at ${this.desc}. The item is in ${this.conditionString} condition. ${ownedText}`;
  }

  toJSON() {
    return omitBy(this, (value, key) => {
      if(!Object.getOwnPropertyDescriptor(this, key)) return true;
      if(key === '_id') return true;
      return false;
    });
  }
}
