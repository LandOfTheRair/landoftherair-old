
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class WillpowerBoost extends Trait {

  static increaseLevel = false;
  static traitName: string = 'WillpowerBoost';
  static description = 'Increase your willpower by 1 point.';
  static icon: string = 'aura';

  static tpCost = 25;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.wil;
  }

  static canBuy(player: Player) {
    return super.canBuy(player) && player.baseStats.wil < 15;
  }

  static buy(player: Player) {
    super.buy(player);
    player.gainBaseStat('wil');
  }

}
