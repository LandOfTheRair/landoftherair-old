
import { Trait } from '../../models/trait';

export class FireMistWiden extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FireMistWiden';
  static description = 'Your Fire Mist spell range is widened by $1|1$ tile.';
  static icon = 'kaleidoscope-pearls';

  static upgrades = [
    { cost: 5, capstone: true }
  ];

}
