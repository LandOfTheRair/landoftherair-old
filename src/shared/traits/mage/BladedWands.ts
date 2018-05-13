
import { Trait } from '../../models/trait';

export class BladedWands extends Trait {

  static baseClass = 'Mage';
  static traitName = 'BladedWands';
  static description = 'You treat wands as longswords of the same tier for the purposes of combat calculations.';
  static icon = 'energy-sword';

  static upgrades = [
    { cost: 50, requireCharacterLevel: 10, capstone: true }
  ];

}
