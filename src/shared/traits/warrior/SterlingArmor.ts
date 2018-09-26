
import { Trait } from '../../models/trait';

export class SterlingArmor extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'SterlingArmor';
  static description = 'Increase your chance of ignoring incoming glancing blows by $10|30$%.';
  static icon = 'chest-armor';

  static upgrades = [
    { }, { }, { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
