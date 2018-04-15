
import { Trait } from '../../models/trait';

export class StrongerSnare extends Trait {

  static baseClass = 'Healer';
  static traitName = 'StrongerSnare';
  static description = 'Your Snare spell will slow the target movement even more yet';
  static icon = 'light-thorny-triskelion';

  static upgrades = [
    { cost: 50, capstone: true }
  ];

}
