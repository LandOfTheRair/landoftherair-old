
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class TotemSpecialty extends Trait {

  static baseClass = 'Healer';
  static traitName = 'WandSpecialty';
  static description = 'Spells cost 2% less per point to cast while holding a totem in your right hand. Requires [Player Level] 10.';
  static icon = 'grapple';

  static tpCost = 20;
  static maxLevel = 5;

  static canBuy(player: Player): boolean {
    return super.canBuy(player, this.tpCost) && player.level >= 10;
  }

}
