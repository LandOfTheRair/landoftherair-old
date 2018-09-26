
import { Trait } from '../../models/trait';

export class MagicFocus extends Trait {

  static baseClass = 'Mage';
  static traitName = 'MagicFocus';
  static description = 'Deal $10|30$% more energy damage.';
  static icon = 'plasma-bolt';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
