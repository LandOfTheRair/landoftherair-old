
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ForcefulStrike extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'ForcefulStrike';
  static description = 'Strike more forcefully, dealing $10|30$% additional damage if your health is above 50%.';
  static icon = 'striped-sword';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { }, { }, { }, { }
  ];

  static currentlyInEffect(player: Player): boolean {
    return super.currentlyInEffect(player) && player.hp.gtePercent(50);
  }

}
