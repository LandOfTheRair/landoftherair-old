
import { Trait } from '../../models/trait';

export class DarkerShadows extends Trait {

  static baseClass = 'Thief';
  static traitName = 'DarkerShadows';
  static description = 'The shadows around you are $2|6$% darker.';
  static icon = 'hidden';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
