
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class Punchkick extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Punchkick';
  static description = 'Your jumpkick ability includes an additional punch.';
  static icon = 'high-kick';

  static upgrades = [
    { cost: 20 }
  ];

  static currentlyInEffect(player: Player): boolean {
    return super.currentlyInEffect(player) && !player.rightHand;
  }

}
