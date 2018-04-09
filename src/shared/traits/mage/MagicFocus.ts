
import { Trait } from '../../models/trait';

export class MagicFocus extends Trait {

  static baseClass = 'Mage';
  static traitName = 'MagicFocus';
  static description = 'Deal 10% more energy damage per point.';
  static icon = 'plasma-bolt';

  static upgrades = [
    { }, { }, { }, { }, { capstone: true }
  ];

}
