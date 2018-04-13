
import { Trait } from '../../models/trait';

export class DoubleStealing extends Trait {

  static baseClass = 'Thief';
  static traitName = 'DoubleStealing';
  static description = 'You will use both hands when stelaing, if possible.';
  static icon = 'take-my-money';

  static upgrades = [
    { cost: 20, capstone: true }
  ];
}
