
import { PartyTrait } from '../../models/partytrait';

export class PartyManaRegen extends PartyTrait {

  static traitName = 'PartyManaRegen';
  static description = 'Increase the mana regeneration of your party.';
  static icon = 'health-increase';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

}
