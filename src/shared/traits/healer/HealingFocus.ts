
import { Trait } from '../../models/trait';

export class HealingFocus extends Trait {

  static baseClass = 'Healer';
  static traitName = 'HealingFocus';
  static description = 'Heal $10|30$% more health when you use restorative magic.';
  static icon = 'health-increase';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
