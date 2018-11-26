
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientAura extends AncientTrait {

  static traitName = 'AncientAura';
  static description = 'Increase your magical resistance by $50|150$.';
  static icon = 'aura';

  static upgrades = [
    { }
  ];

  static usageModifier(level: number): number {
    return level * 50;
  }

}
