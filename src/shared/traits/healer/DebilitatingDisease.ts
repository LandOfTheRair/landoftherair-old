
import { Trait } from '../../models/trait';

export class DebilitatingDisease extends Trait {

  static baseClass = 'Healer';
  static traitName = 'DebilitatingDisease';
  static description = 'Your Disease spell will also lower the CON, WIL, and accuracy of the afflicted target.';
  static icon = 'death-juice';

  static upgrades = [
    { cost: 25 }
  ];

}
