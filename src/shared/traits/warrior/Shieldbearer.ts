
import { Trait } from '../../models/trait';

export class Shieldbearer extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Shieldbearer';
  static description = 'You can hold shields and gain their full effect while they are in your right hand.';
  static icon = 'edged-shield';

  static upgrades = [
    { cost: 50, capstone: true }
  ];

}
