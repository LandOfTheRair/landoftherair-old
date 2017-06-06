
import { extend } from 'lodash';

export const ValidItemTypes = [
  'Mace', 'Axe', 'Dagger', 'Magical', 'OneHandedSword', 'TwoHandedSword', 'Polearm', 'Ranged',
  'Martial', 'Staff', 'HealingMagic', 'ElementalMagic', 'Throwing', 'Thievery'
];

/* TODO Eventually:

  - items that have an xp value, xp max, level, value, level max, and stat growth per item level
  - items that have random stats assigned to them
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

  ac = 0;
  accuracy = 0;
  baseDamage = 5;

  value = 0;
  stats: any = {};
  requirements?: ItemRequirements;
  condition: number = 20000;
  type = 'Martial';

  isBeltable = false;
  isPouchable = true;
  isSackable = true;

  constructor(opts) {
    extend(this, opts);
  }
}
