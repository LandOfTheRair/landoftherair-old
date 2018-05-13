
import { Trait } from '../../models/trait';

export class Multifocus extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Multifocus';
  static description = 'Lower the defensive penalty for using Multistrike by 50%.';
  static icon = 'sword-spin';

  static upgrades = [
    { cost: 40, capstone: true }
  ];

}
