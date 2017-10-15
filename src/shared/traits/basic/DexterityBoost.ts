
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class DexterityBoost extends Trait {

  static increaseLevel = false;
  static traitName: string = 'DexterityBoost';
  static description = 'Increase your dexterity by 1 point.';
  static icon: string = 'bowman';

  static tpCost = 10;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.dex;
  }

  static canBuy(player: Player) {
    return super.canBuy(player) && player.baseStats.dex < 15;
  }

  static buy(player: Player) {
    super.buy(player);
    player.gainBaseStat('dex');
  }

}
