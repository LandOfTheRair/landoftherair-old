
import { PartyTrait } from '../../models/partytrait';

export class PartyDefense extends PartyTrait {

  static traitName = 'PartyDefense';
  static description = 'Increase the defensive capabilities of your party.';
  static icon = 'armor-vest';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
