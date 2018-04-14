
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class ForcefulStrike extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'ForcefulStrike';
  static description = 'Strike more forcefully with your weapon, dealing 10% additional damage per point if your health is above 85%.';
  static icon = 'striped-sword';

  static currentlyInEffect(player: Player): boolean {
    return super.currentlyInEffect(player) && player.hp.gtePercent(85);
  }

}
