
import { Trait } from '../../../shared/models/trait';

export class ImprovedSweep extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'ImprovedSweep';
  static description = 'Remove the defensive penalty for using Sweep and increase the damage by 100%.';
  static icon = 'foot-trip';

  static upgrades = [
    { cost: 30, capstone: true, requireCharacterLevel: 25 }
  ];

  static usageModifier(level: number): number {
    return level ? 1 : 0;
  }

}
