
import { PartyTrait } from '../../models/partytrait';

export class PartyHealthRegen extends PartyTrait {

  static traitName = 'PartyHealthRegen';
  static description = 'Increase your health regeneration while in a party.';
  static icon = 'health-increase';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
