
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class StrengthBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'StrengthBoost';
  static description = 'Increase your strength by 1 point.';
  static icon = 'biceps';

  static tpCost = 10;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.str;
  }

  static canBuy(player: Player) {
    return super.canBuy(player) && player.baseStats.str < 15;
  }

  static buy(player: Player) {
    super.buy(player);
    player.gainBaseStat('str');
  }

}
