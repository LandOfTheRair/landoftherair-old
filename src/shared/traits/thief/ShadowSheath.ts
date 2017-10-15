
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ShadowSheath extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowSheath';
  static description = 'Your weapons are easier to conceal.';
  static icon = 'thrown-knife';

  static tpCost = 10;
  static maxLevel = 10;

}
