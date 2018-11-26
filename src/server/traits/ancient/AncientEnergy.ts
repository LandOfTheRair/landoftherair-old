
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientEnergy extends AncientTrait {

  static traitName = 'AncientEnergy';
  static description = 'Increase your energy resistance by $50|150$.';
  static icon = 'plasma-bolt';

  static upgrades = [
    { }, { }, { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 50;
  }

}
