
import { Trait } from '../../../shared/models/trait';

export class LearnedStrikes extends Trait {

  static baseClass = 'Mage';
  static traitName = 'LearnedStrikes';
  static description = 'Gain weapon skill with each strike.';
  static icon = 'rune-sword';

  static upgrades = [
    { capstone: true, cost: 10 }
  ];

}
