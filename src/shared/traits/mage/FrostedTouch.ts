
import { Trait } from '../../models/trait';

export class FrostedTouch extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FrostedTouch';
  static description = 'Your ice spells freeze the opponent more quickly.';
  static icon = 'ice-spell-cast';

  static tpCost = 20;
  static maxLevel = 5;

}
