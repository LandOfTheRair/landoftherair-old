
import { Trait } from '../../models/trait';

export class ShadowSwap extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowSwap';
  static description = 'Swap places with your shadow in combat 2% more per point.';
  static icon = 'shadow-follower';

  static tpCost = 20;
  static maxLevel = 10;

}
