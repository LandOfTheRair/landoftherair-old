
import { Trait } from '../../models/trait';

export class NimbleStealing extends Trait {

  static baseClass = 'Thief';
  static traitName = 'NimbleStealing';
  static description = 'You are $5|15$% less likely to be discovered when stealing, and you steal more currentGold when you are successful.';
  static icon = 'take-my-money';

  static upgrades = [
    { }, { }, { capstone: true }
  ];
}
