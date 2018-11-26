
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientPotions extends AncientTrait {

  static traitName = 'AncientPotions';
  static description = 'Increase the healing from all potions by $500|1500$.';
  static icon = 'bubbling-flask';

  static upgrades = [
    { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 500;
  }

}
