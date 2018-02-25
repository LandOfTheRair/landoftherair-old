
import { Trait } from '../../models/trait';

export class ShadowSheath extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowSheath';
  static description = 'Your weapons are 1% easier per point to conceal.';
  static icon = 'thrown-knife';

  static tpCost = 10;
  static maxLevel = 10;

}
