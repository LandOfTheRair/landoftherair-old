
import { PartyTrait } from '../../models/partytrait';

export class PartyOffense extends PartyTrait {

  static traitName = 'PartyOffense';
  static description = 'Increase the offensive capabilities of your party.';
  static icon = 'sword-clash';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
