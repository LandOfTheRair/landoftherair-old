
import { PartyTrait } from '../../models/partytrait';

export class PartyManaRegen extends PartyTrait {

  static traitName = 'PartyManaRegen';
  static description = 'Increase the mana regeneration of your party by +$2|6$.';
  static icon = 'health-increase';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
