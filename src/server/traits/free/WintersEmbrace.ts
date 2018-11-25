
import { FreeTrait } from '../../../shared/models/trait';

export class WintersEmbrace extends FreeTrait {

  static traitName = 'WintersEmbrace';
  static description = 'When you frost an enemy, it has a $10|30$% chance to freeze them solid.';
  static icon = '';

  static upgrades = [];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
