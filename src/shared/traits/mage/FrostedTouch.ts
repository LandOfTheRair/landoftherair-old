
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class FrostedTouch extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FrostedTouch';
  static description = 'Your ice spells freeze the opponent more quickly. Requires [Player Level] 10.';
  static icon = 'ice-spell-cast';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static canBuy(player: Player): boolean {
    return super.canBuy(player) && player.level >= 10;
  }

}
