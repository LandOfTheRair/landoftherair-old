
import { Trait } from '../../../shared/models/trait';

export class ImprovedRapidpunch extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'ImprovedRapidpunch';
  static description = 'Remove the defensive and accuracy penalty for using Rapidpunch and increase the damage by 20%.';
  static icon = 'fire-punch';

  static upgrades = [
    { cost: 50, capstone: true, requireCharacterLevel: 35 }
  ];

  static usageModifier(level: number): number {
    return level ? 20 : 0;
  }

}
