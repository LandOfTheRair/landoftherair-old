
import { PartyTrait } from '../../models/partytrait';

export class PartyManaRegeneration extends PartyTrait {

  static traitName = 'PartyManaRegeneration';
  static description = 'Increase the mana regeneration of your party by +$2|6$.';
  static icon = 'health-increase';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
