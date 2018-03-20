
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ShadowDaggers extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowDaggers';
  static description = 'Your plain melee attacks turn into backstabs 1% of the time per point. Requires [Player Level] 15.';
  static icon = 'daggers';

  static tpCost = 10;
  static maxLevel = 10;

  static canBuy(player: Player): boolean {
    return Trait.canBuy(player) && player.level >= 15;
  }
}
