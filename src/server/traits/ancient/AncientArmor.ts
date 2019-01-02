
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientArmor extends AncientTrait {

  static traitName = 'AncientArmor';
  static description = 'Increase your armor class by $3|9$.';
  static icon = 'armor-vest';

  static upgrades = [
    { }, { }, { capstone: true }, { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
