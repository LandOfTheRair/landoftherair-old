
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientRegeneration extends AncientTrait {

  static traitName = 'AncientRegeneration';
  static description = 'Increase your HP/MP regeneration by $3|9$.';
  static icon = 'psychic-waves';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
