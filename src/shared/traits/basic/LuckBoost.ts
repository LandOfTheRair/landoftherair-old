
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class LuckBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'LuckBoost';
  static description = 'Increase your luck by 1 point.';
  static icon = 'clover';

  static tpCost = 25;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.luk;
  }

  static canBuy(player: Player) {
    return super.canBuy(player) && player.baseStats.luk < 15;
  }

  static buy(player: Player) {
    super.buy(player);
    player.gainBaseStat('luk');
  }

}
