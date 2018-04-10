
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class IrresistibleStuns extends Trait {

  static baseClass = 'Healer';
  static traitName = 'IrresistibleStuns';
  static description = 'Reduce your stun targets WIL by 1 per pt. Requires [Player Level] 10.';
  static icon = 'knockout';

  static tpCost = 20;
  static maxLevel = 5;

  static canBuy(player: Player): boolean {
    return super.canBuy(player, this.tpCost) && player.level >= 10;
  }

}
