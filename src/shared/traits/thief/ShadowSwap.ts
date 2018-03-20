
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ShadowSwap extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowSwap';
  static description = 'Swap places with your shadow in combat 2% more per point. Requires [Player Level] 10.';
  static icon = 'shadow-follower';

  static tpCost = 20;
  static maxLevel = 10;

  static canBuy(player: Player): boolean {
    return Trait.canBuy(player) && player.level >= 10;
  }

}
