
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class WillpowerBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'WillpowerBoost';
  static description = 'Increase your willpower by 1 point.';
  static icon = 'aura';

  static tpCost = 25;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.wil;
  }

  static canBuy(player: Player) {
    return Trait.canBuy(player) && player.baseStats.wil < 15;
  }

  static buy(player: Player) {
    Trait.buy(player);
    player.gainBaseStat('wil');
  }

}
