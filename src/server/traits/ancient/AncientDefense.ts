
import { AncientTrait } from '../../../shared/models/ancienttrait';

export class AncientDefense extends AncientTrait {

  static traitName = 'AncientDefense';
  static description = 'Increase your defense by $3|9$.';
  static icon = 'wingfoot';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
