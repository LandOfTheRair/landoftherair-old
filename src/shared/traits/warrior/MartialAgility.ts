
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class MartialAgility extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'MartialAgility';
  static description = 'Gain a $20|60$% bonus to dodging melee attacks if you have open hands. If both of your hands are open, the bonus is higher.';
  static icon = 'wingfoot';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static currentlyInEffect(player: Player): boolean {
    return super.currentlyInEffect(player) && (!player.rightHand || !player.leftHand);
  }

}
