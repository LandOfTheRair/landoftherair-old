
import { Trait } from '../../models/trait';

export class CarefulTouch extends Trait {

  static traitName = 'CarefulTouch';
  static description = 'Decrease the damage your items take.';
  static icon = 'blacksmith';

  static tpCost = 10;
  static maxLevel = 10;

}
