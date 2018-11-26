
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientMitigation extends AncientTrait {

  static traitName = 'AncientMitigation';
  static description = 'Increase your mitigation by $1|3$.';
  static icon = 'chest-armor';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level;
  }

}
