
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

import { get, includes } from 'lodash';
import { RobeClasses } from '../../models/item';

export class UnarmoredSavant extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'UnarmoredSavant';
  static description = 'Gain a 40% bonus to mitigation if you are using a robe or cloak in your main armor slot.';
  static icon = 'robe';

  static upgrades = [
    { cost: 30, capstone: true }
  ];

  static currentlyInEffect(player: Player): boolean {
    const itemClass = get(player, 'gear.Armor.itemClass');
    return super.currentlyInEffect(player) && (includes(RobeClasses, itemClass));
  }

  static usageModifier(level: number): number {
    return level ? 40 : 0;
  }

}
