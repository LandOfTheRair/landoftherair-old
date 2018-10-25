
import { Trait } from '../../models/trait';

export class DarkerShadows extends Trait {

  static baseClass = 'Thief';
  static traitName = 'DarkerShadows';
  static description = 'Your hide stat is $2|6$% higher.';
  static icon = 'hidden';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
