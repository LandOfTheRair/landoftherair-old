
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class WisdomBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'WisdomBoost';
  static description = 'Increase your wisdom by 1 point.';
  static icon = 'embrassed-energy';

  static tpCost = 10;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.wis;
  }

  static canBuy(player: Player) {
    return super.canBuy(player) && player.baseStats.wis < 15;
  }

  static buy(player: Player) {
    super.buy(player);
    player.gainBaseStat('wis');
  }

}
