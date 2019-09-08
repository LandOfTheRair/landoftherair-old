
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class SustainedImmunity extends AncientTrait {

  static traitName = 'SustainedImmunity';
  static description = 'Increase the duration of bad "Recently" effects by $20|60$%.';
  static icon = 'auto-repair';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return (0.2 * level);
  }

}
