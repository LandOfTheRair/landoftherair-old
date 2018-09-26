
import { Trait } from '../../models/trait';

export class FriendlyFire extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FriendlyFire';
  static description = 'Your fire and ice spells have a +$10|30$% chance of not hitting allied creatures.';
  static icon = 'fire-bowl';

  static upgrades = [
    { requireCharacterLevel: 10 }, { requireCharacterLevel: 10 }, { requireCharacterLevel: 15, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
