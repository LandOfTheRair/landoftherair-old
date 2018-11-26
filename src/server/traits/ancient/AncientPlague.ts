
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientPlague extends AncientTrait {

  static traitName = 'AncientPlague';
  static description = 'Increase your disease resistance by $50|150$.';
  static icon = 'death-zone';

  static upgrades = [
    { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 50;
  }

}
