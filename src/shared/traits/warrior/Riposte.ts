
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class Riposte extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Riposte';
  static description = 'Increase the chance of counter-attacking enemies by 1% per point. Requires [Player Level] 15.';
  static icon = 'sword-clash';

  static tpCost = 10;
  static maxLevel = 10;

  static canBuy(player: Player): boolean {
    return super.canBuy(player) && player.level >= 15;
  }

}
