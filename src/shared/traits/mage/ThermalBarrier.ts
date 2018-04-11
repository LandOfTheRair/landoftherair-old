
import { Trait } from '../../models/trait';

export class ThermalBarrier extends Trait {

  static baseClass = 'Mage';
  static traitName = 'ThermalBarrier';
  static description = 'Your fire and ice protection spells are enhanced by +10% per point.';
  static icon = 'transportation-rings';

  static upgrades = [
    { requireCharacterLevel: 10 }, { requireCharacterLevel: 10 }, { requireCharacterLevel: 15, capstone: true }
  ];

}
