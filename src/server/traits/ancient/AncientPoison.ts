
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientPoison extends AncientTrait {

  static traitName = 'AncientPoison';
  static description = 'Increase your poison resistance by $50|150$.';
  static icon = 'poison-gas';

  static upgrades = [
    { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 50;
  }

}
