
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class AgilityBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'AgilityBoost';
  static description = 'Increase your agility by 1 point.';
  static icon = 'sprint';

  static tpCost = 10;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.agi;
  }

  static canBuy(player: Player) {
    return super.canBuy(player) && player.baseStats.agi < 15;
  }

  static buy(player: Player) {
    super.buy(player);
    player.gainBaseStat('agi');
  }

}
