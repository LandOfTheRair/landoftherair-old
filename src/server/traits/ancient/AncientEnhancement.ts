
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientEnhancement extends AncientTrait {

  static traitName = 'AncientEnergy';
  static description = 'Your over-time spells last $10|30$% longer.';
  static icon = 'burning-passion';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 0.1;
  }

}
