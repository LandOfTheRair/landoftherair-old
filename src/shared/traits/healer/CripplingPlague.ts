
import { Trait } from '../../models/trait';

export class CripplingPlague extends Trait {

  static baseClass = 'Healer';
  static traitName = 'CripplingPlague';
  static description = 'Your Plague spell will also lower the attack and defense of the afflicted target.';
  static icon = 'death-zone';

  static upgrades = [
    { cost: 10, capstone: true }
  ];

}
