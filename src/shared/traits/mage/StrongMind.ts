
import { Trait } from '../../models/trait';

export class StrongMind extends Trait {

  static baseClass = 'Mage';
  static traitName = 'StrongMind';
  static description = 'Add 10% of your INT per point to your STR in melee combat.';
  static icon = 'brain';

  static upgrades = [
    { cost: 50, requireCharacterLevel: 15, capstone: true }
  ];

}
