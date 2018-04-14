
import { Trait } from '../../models/trait';

export class BrassKnuckles extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'BrassKnuckles';
  static description = 'Your open-hand fist attacks are stronger.';
  static icon = 'brass-knuckles';

  static upgrades = [
    { cost: 20 }, { cost: 20 }, { cost: 20 }
  ];

}