
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class Clearcasting extends AncientTrait {

  static traitName = 'Clearcasting';
  static description = 'Increase the chance of not consuming resources when casting a spell by $3|9$%.';
  static icon = 'magic-swirl';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
