
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class MartialAcuity extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'MartialAcuity';
  static description = 'Gain an offensive bonus when trying to physically hit another creature.';
  static icon = 'armor-punch';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static currentlyInEffect(player: Player): boolean {
    return super.currentlyInEffect(player) && !player.rightHand;
  }

}
