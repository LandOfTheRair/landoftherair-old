
import { PartyTrait } from '../../models/partytrait';

export class PartyHealthRegen extends PartyTrait {

  static traitName = 'PartyHealthRegen';
  static description = 'Increase your health regeneration while in a party.';
  static icon = 'health-increase';

  static tpCost = 25;
  static maxLevel = 20;

}
