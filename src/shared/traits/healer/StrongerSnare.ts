
import { Trait } from '../../models/trait';

export class StrongerSnare extends Trait {

  static baseClass = 'Healer';
  static traitName = 'StrongerSnare';
  static description = 'Your Snare spell more effectively slows down the target.';
  static icon = 'light-thorny-triskelion';

  static upgrades = [
    { cost: 50, capstone: true }
  ];

}
