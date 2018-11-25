
import { Trait } from '../../../shared/models/trait';

export class Swashbuckler extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Swashbuckler';
  static description = 'Reduce your chance of an outgoing glancing blow by $12.5|37.5$%.';
  static icon = 'spiral-thrust';

  static upgrades = [
    { }, { }, { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return Math.max(0.025, 1 - (level * 0.125));
  }

}
