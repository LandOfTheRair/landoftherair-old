
import { Trait } from '../../models/trait';

export class NecroticFocus extends Trait {

  static baseClass = 'Healer';
  static traitName = 'NecroticFocus';
  static description = 'Deal $10|30$% more necrotic damage.';
  static icon = 'plasma-bolt';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
