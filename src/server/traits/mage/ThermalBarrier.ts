
import { Trait } from '../../../shared/models/trait';

export class ThermalBarrier extends Trait {

  static baseClass = 'Mage';
  static traitName = 'ThermalBarrier';
  static description = 'Your fire and ice protection spells are enhanced by +$20|60$%.';
  static icon = 'transportation-rings';

  static upgrades = [
    { requireCharacterLevel: 10 }, { requireCharacterLevel: 10 }, { requireCharacterLevel: 15, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 0.2;
  }

}
