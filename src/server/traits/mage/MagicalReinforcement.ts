
import { get } from 'lodash';

import { Trait } from '../../../shared/models/trait';
import { Character } from '../../../shared/models/character';

export class MagicalReinforcement extends Trait {

  static baseClass = 'Mage';
  static traitName = 'MagicalReinforcement';
  static description = 'Gain +1 defense per weapon skill.';
  static icon = 'shining-sword';

  static upgrades = [
    { cost: 15 }, { cost: 30 }
  ];

  static usageModifier(level: number, char: Character): number {
    return level * char.calcSkillLevel(get(char.rightHand, 'type', 'Martial'));
  }

}
