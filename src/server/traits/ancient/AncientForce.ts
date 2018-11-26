
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientForce extends AncientTrait {

  static traitName = 'AncientForce';
  static description = 'Increase your damage by $5|15$%.';
  static icon = 'crossed-swords';

  static upgrades = [
    { }, { }, { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 0.05;
  }

}
