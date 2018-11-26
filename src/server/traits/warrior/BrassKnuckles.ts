
import { Trait } from '../../../shared/models/trait';
import { Player } from '../../../shared/models/player';

export class BrassKnuckles extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'BrassKnuckles';
  static description = 'Your open-hand fist attacks gain a +$1|3$ tier bonus.';
  static icon = 'brass-knuckles';

  static upgrades = [
    { cost: 10 }, { cost: 10 }, { cost: 10 }
  ];

  static currentlyInEffect(player: Player): boolean {
    return super.currentlyInEffect(player) && !player.rightHand;
  }

}
