
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientForge extends AncientTrait {

  static traitName = 'AncientForge';
  static description = 'Increase your fire resistance by $50|150$.';
  static icon = 'celebration-fire';

  static upgrades = [
    { }, { }, { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 50;
  }

}
