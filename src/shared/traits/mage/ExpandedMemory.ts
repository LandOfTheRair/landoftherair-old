
import { Trait } from '../../models/trait';

export class ExpandedMemory extends Trait {

  static baseClass = 'Mage';
  static traitName = 'ExpandedMemory';
  static description = 'Gain +$10|30$ maximum teleport locations.';
  static icon = 'teleport';

  static upgrades = [
    { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
