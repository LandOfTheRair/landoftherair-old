
import { Trait } from '../../../shared/models/trait';

export class ImprovedBoostedBoost extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'ImprovedBoostedBoost';
  static description = 'Boost adds +$3|9$ more to each stat boosted. WIL/HPREGEN is also boosted. There is no longer any penalty for using Boost.';
  static icon = 'fist';

  static upgrades = [
    { cost: 25, requireCharacterLevel: 30 }, { cost: 50, capstone: true, requireCharacterLevel: 40 }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
