
import { FreeTrait } from '../../models/trait';

export class WintersEmbrace extends FreeTrait {

  static traitName = 'WintersEmbrace';
  static description = 'Gain $100|300$ more ice damage, ice resist, and when you chill an enemy, it has a $10|30$% chance to freeze them solid.';
  static icon = '';

  static upgrades = [];

  static usageModifier(level: number): number {
    return level * 0.2;
  }

}
