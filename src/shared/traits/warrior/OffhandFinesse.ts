
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class OffhandFinesse extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'OffhandFinesse';
  static description = 'Increase your offhand attack damage by 10% per point. Requires [Player Level] 10.';
  static icon = 'crossed-axes';

  static tpCost = 10;
  static maxLevel = 10;

  static canBuy(player: Player): boolean {
    return super.canBuy(player) && player.level >= 10;
  }
}
