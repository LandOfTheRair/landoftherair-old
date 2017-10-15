
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class IntelligenceBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'IntelligenceBoost';
  static description = 'Increase your intelligence by 1 point.';
  static icon = 'bookmarklet';

  static tpCost = 10;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.int;
  }

  static canBuy(player: Player) {
    return super.canBuy(player) && player.baseStats.int < 15;
  }

  static buy(player: Player) {
    super.buy(player);
    player.gainBaseStat('int');
  }

}
