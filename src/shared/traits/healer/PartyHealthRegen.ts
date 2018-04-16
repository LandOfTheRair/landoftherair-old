
import { PartyTrait } from '../../models/partytrait';

export class PartyHealthRegen extends PartyTrait {

  static traitName = 'PartyHealthRegen';
  static description = 'Increase the health regeneration of your party by +$2|6$.';
  static icon = 'health-increase';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
