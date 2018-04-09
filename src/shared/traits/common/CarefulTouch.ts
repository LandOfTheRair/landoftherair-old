
import { Trait } from '../../models/trait';

export class CarefulTouch extends Trait {

  static traitName = 'CarefulTouch';
  static description = 'Decrease the damage your items take by 5% per point.';
  static icon = 'blacksmith';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

}
