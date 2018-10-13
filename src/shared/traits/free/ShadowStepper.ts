
import { FreeTrait } from '../../models/trait';

export class ShadowStepper extends FreeTrait {

  static traitName = 'ShadowStepper';
  static description = 'Gain $15|45$% more stealth.';
  static icon = '';

  static upgrades = [];

  static usageModifier(level: number): number {
    return level * 15;
  }

}
