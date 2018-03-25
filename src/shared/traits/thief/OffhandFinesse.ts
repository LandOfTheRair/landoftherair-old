
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class OffhandFinesse extends Trait {

  static baseClass = 'Thief';
  static traitName = 'OffhandFinesse';
  static description = 'Increase your offhand attack damage by 10% per point. Requires [Player Level] 10.';
  static icon = 'crossed-sabres';

  static tpCost = 15;
  static maxLevel = 15;

  static canBuy(player: Player): boolean {
    return super.canBuy(player) && player.level >= 10;
  }

}
