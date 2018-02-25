
import { Trait } from '../../models/trait';

export class DarkerShadows extends Trait {

  static baseClass = 'Thief';
  static traitName = 'DarkerShadows';
  static description = 'The shadows around you are 5% darker per point.';
  static icon = 'hidden';

  static tpCost = 10;
  static maxLevel = 10;

}
