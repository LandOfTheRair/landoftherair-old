
import { Trait } from '../../models/trait';

export class DoubleStealing extends Trait {

  static baseClass = 'Thief';
  static traitName = 'DoubleStealing';
  static description = 'You will use both hands when stealing, if possible.';
  static icon = 'take-my-money';

  static upgrades = [
    { cost: 30, capstone: true }
  ];
}
