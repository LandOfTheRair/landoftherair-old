
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ConstitutionBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'ConstitutionBoost';
  static description = 'Increase your constitution by 1 point.';
  static icon = 'glass-heart';

  static tpCost = 5;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.con;
  }

  static canBuy(player: Player) {
    return Trait.canBuy(player) && player.baseStats.con < 15;
  }

  static buy(player: Player) {
    Trait.buy(player);
    player.gainBaseStat('con');
  }

}
