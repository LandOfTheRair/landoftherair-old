
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

import { get, includes } from 'lodash';
import { RobeClasses } from '../../models/item';
import { Character } from '../../models/character';

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
    return super.currentlyInEffect(player) && (includes(RobeClasses, itemClass) || itemClass === 'Fur');
  }

  static usageModifier(level: number, char: Character): number {
    if(!level) return 0;

    const itemClass = get(char, 'gear.Armor.itemClass');
    if(itemClass === 'Fur') return 30;

    return 40;
  }

}
