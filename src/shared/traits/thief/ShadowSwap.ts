
import { Trait } from '../../models/trait';

export class ShadowSwap extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowSwap';
  static description = 'Periodically swap places with your shadow in combat.';
  static icon = 'shadow-follower';

  static tpCost = 20;
  static maxLevel = 10;

}
