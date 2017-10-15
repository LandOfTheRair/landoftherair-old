
import { Trait } from '../../models/trait';

export class MagicFocus extends Trait {

  static baseClass = 'Mage';
  static traitName: string = 'MagicFocus';
  static description = 'Deal more energy damage.';
  static icon: string = 'plasma-bolt';

  static tpCost = 10;
  static maxLevel = 10;

}
