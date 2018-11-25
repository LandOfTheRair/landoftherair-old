
import { Trait } from '../../../shared/models/trait';

export class DegenerativeVenom extends Trait {

  static baseClass = 'Thief';
  static traitName = 'DegenerativeVenom';
  static description = 'Your Venom spell will also lower the perception of the afflicted target.';
  static icon = 'dripping-goo';

  static upgrades = [
    { cost: 10, capstone: true }
  ];

}
