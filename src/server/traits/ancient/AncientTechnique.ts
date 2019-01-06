
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientTechnique extends AncientTrait {

  static traitName = 'AncientTechnique';
  static description = 'Decrease your aggro generation by $10|30$%.';
  static icon = 'diamonds-smile';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return (0.1 * level);
  }

}
