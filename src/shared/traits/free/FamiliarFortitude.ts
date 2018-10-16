
import { FreeTrait } from '../../models/trait';

export class FamiliarFortitude extends FreeTrait {

  static traitName = 'FamiliarFortitude';
  static description = 'Familiars gain +$10|30$% HP.';
  static icon = '';

  static upgrades = [];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
