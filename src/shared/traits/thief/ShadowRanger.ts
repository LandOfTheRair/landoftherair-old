
import { Trait } from '../../models/trait';

export class ShadowRanger extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowRanger';
  static description = 'Do 4% more damage while hidden per point.';
  static icon = 'on-sight';

  static tpCost = 10;
  static maxLevel = 10;

}
