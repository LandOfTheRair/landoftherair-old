
import { Trait } from '../../models/trait';

export class HolyProtection extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'HolyProtection';
  static description = 'Decrease the amount of magical damage you take.';
  static icon = 'holy-symbol';

  static upgrades = [
    { }, { }, { }, { }, { capstone: true }
  ];

}
