
import { Trait } from '../../models/trait';

export class HolyProtection extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'HolyProtection';
  static description = 'Decrease the amount of magical damage you take by $10|30$.';
  static icon = 'holy-symbol';

  static upgrades = [
    { }, { }, { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
