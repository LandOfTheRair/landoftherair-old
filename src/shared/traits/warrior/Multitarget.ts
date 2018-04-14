
import { Trait } from '../../models/trait';

export class Multitarget extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Multitarget';
  static description = 'Increase the number of enemies you can strike with Multistrike.';
  static icon = 'sword-spin';

  static upgrades = [
    { cost: 10 }, { cost: 10 }
  ];

}
