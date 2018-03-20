
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class CharismaBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'CharismaBoost';
  static description = 'Increase your charisma by 1 point.';
  static icon = 'rose';

  static tpCost = 25;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.cha;
  }

  static canBuy(player: Player) {
    return Trait.canBuy(player) && player.baseStats.cha < 15;
  }

  static buy(player: Player) {
    Trait.buy(player);
    player.gainBaseStat('cha');
  }

}
