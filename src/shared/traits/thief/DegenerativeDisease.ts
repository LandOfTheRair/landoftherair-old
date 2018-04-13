
import { Trait } from '../../models/trait';

export class DegenerativeDisease extends Trait {

  static baseClass = 'Thief';
  static traitName = 'DegenerativeDisease';
  static description = 'Your Disease spell will also lower the perception of the afflicted target.';
  static icon = 'death-juice';

  static upgrades = [
    { cost: 35, capstone: true }
  ];

}
