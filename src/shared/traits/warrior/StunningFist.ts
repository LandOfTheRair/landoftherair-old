
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class StunningFist extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'StunningFist';
  static description = 'Increase your chance of stunning an opponent with a fist attack.';
  static icon = 'thor-fist';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static currentlyInEffect(player: Player): boolean {
    return super.currentlyInEffect(player) && !player.rightHand;
  }

}
