
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientSkin extends AncientTrait {

  static traitName = 'AncientSkin';
  static description = 'Increase your physical resistance by $50|150$.';
  static icon = 'leg-armor';

  static upgrades = [
    { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 50;
  }

}
