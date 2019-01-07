
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class PotentApplications extends AncientTrait {

  static traitName = 'PotentApplications';
  static description = 'Your applications last $600|1800$ seconds longer.';
  static icon = 'bloody-sword';

  static upgrades = [
    { }
  ];

  static usageModifier(level: number): number {
    return level * 600;
  }

}
