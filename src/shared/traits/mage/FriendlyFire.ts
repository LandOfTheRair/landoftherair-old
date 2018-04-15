
import { Trait } from '../../models/trait';

export class FriendlyFire extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FriendlyFire';
  static description = 'Your fire and ice spells have a +10% chance per point of not hitting allied creatures.';
  static icon = 'fire-bowl';

  static upgrades = [
    { requireCharacterLevel: 10 }, { requireCharacterLevel: 10 }, { requireCharacterLevel: 15, capstone: true }
  ];

}
