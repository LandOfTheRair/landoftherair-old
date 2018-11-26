
import { Trait } from '../../../shared/models/trait';

export class DoubleThrust extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'DoubleThrust';
  static description = 'Thruststrike now attacks with a slightly-weaker second swing.';
  static icon = 'saber-slash';

  static upgrades = [
    { cost: 20, capstone: true, requireCharacterLevel: 20 }
  ];

}
