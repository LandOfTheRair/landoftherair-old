
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class EffectiveSupporter extends Trait {

  static baseClass = 'Healer';
  static traitName = 'EffectiveSupporter';
  static description = 'Your support spells last 10% longer per point. Requires [Player Level] 15.';
  static icon = 'burning-passion';

  static tpCost = 10;
  static maxLevel = 10;

  static canBuy(player: Player): boolean {
    return super.canBuy(player) && player.level >= 15;
  }

}
