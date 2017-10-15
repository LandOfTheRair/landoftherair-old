
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class DarkerShadows extends Trait {

  static baseClass = 'Thief';
  static traitName = 'DarkerShadows';
  static description = 'The shadows around you are darker.';
  static icon = 'hidden';

  static tpCost = 10;
  static maxLevel = 10;

}
