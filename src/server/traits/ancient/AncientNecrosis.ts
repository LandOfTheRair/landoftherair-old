
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientNecrosis extends AncientTrait {

  static traitName = 'AncientNecrosis';
  static description = 'Increase your necrotic resistance by $50|150$.';
  static icon = 'plasma-bolt';

  static upgrades = [
    { }, { }, { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 50;
  }

}
