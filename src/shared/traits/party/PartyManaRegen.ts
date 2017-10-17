
import { PartyTrait } from '../../models/partytrait';

export class PartyManaRegen extends PartyTrait {

  static traitName = 'PartyManaRegen';
  static description = 'Increase your mana regeneration while in a party.';
  static icon = 'health-increase';

  static tpCost = 25;
  static maxLevel = 20;

}
