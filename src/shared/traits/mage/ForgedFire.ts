
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ForgedFire extends Trait {

  static baseClass = 'Mage';
  static traitName = 'ForgedFire';
  static description = 'Your fire spells burn the opponent more quickly. Requires [Player Level] 10.';
  static icon = 'flame-spin';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static canBuy(player: Player): boolean {
    return super.canBuy(player) && player.level >= 10;
  }

}
