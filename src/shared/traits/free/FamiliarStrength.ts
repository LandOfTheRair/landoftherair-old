
import { FreeTrait } from '../../models/trait';

export class FamiliarStrength extends FreeTrait {

  static traitName = 'FamiliarStrength';
  static description = 'Familiars gain +$2|6$ STR/INT/WIS.';
  static icon = '';

  static upgrades = [];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
