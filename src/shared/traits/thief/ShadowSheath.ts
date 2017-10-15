
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ShadowSheath extends Trait {

  static baseClass = 'Thief';
  static traitName: string = 'ShadowSheath';
  static description = 'Your weapons are easier to conceal.';
  static icon: string = 'thrown-knife';

  static tpCost = 10;
  static maxLevel = 10;

}
