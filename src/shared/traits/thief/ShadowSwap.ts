
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ShadowSwap extends Trait {

  static baseClass = 'Thief';
  static traitName: string = 'ShadowSwap';
  static description = 'Periodically swap places with your shadow in combat.';
  static icon: string = 'shadow-follower';

  static tpCost = 20;
  static maxLevel = 10;

}
