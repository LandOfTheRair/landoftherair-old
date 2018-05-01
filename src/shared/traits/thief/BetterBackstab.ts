
import { Trait } from '../../models/trait';

export class BetterBackstab extends Trait {

  static baseClass = 'Thief';
  static traitName = 'BetterBackstab';
  static description = 'Increase your backstab damage multiplier by $1|3$.';
  static icon = 'backstab';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

}
