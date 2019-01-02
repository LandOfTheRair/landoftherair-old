
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientGrip extends AncientTrait {

  static traitName = 'AncientGrip';
  static description = 'Increase your chance to hold onto your items by $15|45$.';
  static icon = 'drop-weapon';

  static upgrades = [
    { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
