
import { Trait } from '../../models/trait';

export class BladedWands extends Trait {

  static baseClass = 'Mage';
  static traitName = 'BladedWands';
  static description = 'You treat wands as longswords at tier + 3 for the purposes of combat calculations.';
  static icon = 'energy-sword';

  static upgrades = [
    { cost: 30, requireCharacterLevel: 10, capstone: true }
  ];

}
