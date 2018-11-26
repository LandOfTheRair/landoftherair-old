
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientBlizzard extends AncientTrait {

  static traitName = 'AncientBlizzard';
  static description = 'Increase your ice resistance by $50|150$.';
  static icon = 'melting-ice-cube';

  static upgrades = [
    { }, { }, { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 50;
  }

}
