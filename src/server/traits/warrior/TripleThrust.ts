
import { Trait } from '../../../shared/models/trait';

export class TripleThrust extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'TripleThrust';
  static description = 'Thruststrike now attacks with a slightly-weaker third swing.';
  static icon = 'saber-slash';

  static upgrades = [
    { cost: 40, capstone: true, requireCharacterLevel: 30 }
  ];

}
