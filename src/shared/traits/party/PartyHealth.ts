
import { PartyTrait } from '../../models/partytrait';

export class PartyHealth extends PartyTrait {

  static traitName = 'PartyHealth';
  static description = 'Increase your health while in a party.';
  static icon = 'health-increase';

  static tpCost = 25;
  static maxLevel = 20;

}
