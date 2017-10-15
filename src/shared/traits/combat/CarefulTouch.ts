
import { Trait } from '../../models/trait';

export class CarefulTouch extends Trait {

  static traitName: string = 'CarefulTouch';
  static description = 'Decrease the damage your items take.';
  static icon: string = 'blacksmith';

  static tpCost = 10;
  static maxLevel = 10;

}
