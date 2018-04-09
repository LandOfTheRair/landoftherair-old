
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class WandSpecialty extends Trait {

  static baseClass = 'Mage';
  static traitName = 'WandSpecialty';
  static description = 'Spells cost 2% less per point to cast while holding a wand in your right hand. Requires [Player Level] 10.';
  static icon = 'fairy-wand';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static canBuy(player: Player): boolean {
    return super.canBuy(player) && player.level >= 10;
  }

}
