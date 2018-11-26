
import { Trait } from '../../../shared/models/trait';

export class BoostedBoost extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'BoostedBoost';
  static description = 'Boost adds +$1|3$ more to each stat boosted.';
  static icon = 'fist';

  static upgrades = [
    { cost: 5 }, { cost: 10, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level;
  }

}
