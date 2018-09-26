
import { FreeTrait } from '../../models/trait';

export class SlowDigestion extends FreeTrait {

  static traitName = 'SlowDigestion';
  static description = 'Digest food $20|60$% more slowly.';
  static icon = '';

  static upgrades = [];

  static usageModifier(level: number): number {
    return level * 0.2;
  }

}
