
import { Trait } from '../../models/trait';

export class IceMistWiden extends Trait {

  static baseClass = 'Mage';
  static traitName = 'IceMistWiden';
  static description = 'Your Ice Mist spell range is widened by $1|1$ tile.';
  static icon = 'kaleidoscope-pearls';

  static upgrades = [
    { cost: 5, capstone: true }
  ];

}
