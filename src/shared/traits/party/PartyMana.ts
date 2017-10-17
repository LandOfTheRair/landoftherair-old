
import { PartyTrait } from '../../models/partytrait';

export class PartyMana extends PartyTrait {

  static traitName = 'PartyMana';
  static description = 'Increase your mana while in a party.';
  static icon = 'health-increase';

  static tpCost = 25;
  static maxLevel = 20;

}
