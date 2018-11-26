
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientOffense extends AncientTrait {

  static traitName = 'AncientOffense';
  static description = 'Increase your offense by $3|9$.';
  static icon = 'sword-clash';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
