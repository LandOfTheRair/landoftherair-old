
import { Trait } from '../../../shared/models/trait';

export class ImprovedMultifocus extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'ImprovedMultifocus';
  static description = 'Remove the defensive penalty for using Multistrike.';
  static icon = 'sword-spin';

  static upgrades = [
    { cost: 30, capstone: true, requireCharacterLevel: 35 }
  ];

}
