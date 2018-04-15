
import { Trait } from '../../models/trait';

export class MartialAgility extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'MartialAgility';
  static description = 'Gain a bonus to dodging melee attacks if you have open hands. If both of your hands are open, the bonus is higher.';
  static icon = 'wingfoot';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

}
