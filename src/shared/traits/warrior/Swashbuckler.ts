
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class Swashbuckler extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Swashbuckler';
  static description = 'Further enhance your sword craft, strengthening your offense by 1 per point. Requires [Sword Tricks] Level 5';
  static icon = 'sword-clash';

  static tpCost = 20;
  static maxLevel = 10;

  static canBuy(player: Player): boolean {
    return super.canBuy(player) && player.getBaseTraitLevel('SwordTricks') === 5;
  }

}
