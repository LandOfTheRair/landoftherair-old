
import { Trait } from '../../models/trait';

export class Punchkick extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Punchkick';
  static description = 'Your jumpkick ability includes an additional punch.';
  static icon = 'high-kick';

  static upgrades = [
    { cost: 20 }
  ];

}
