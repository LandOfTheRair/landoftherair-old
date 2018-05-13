
import { Trait } from '../../models/trait';

export class WiderTraps extends Trait {

  static baseClass = 'Thief';
  static traitName = 'WiderTraps';
  static description = 'Your area of effect traps are wider by $1|1$ tile.';
  static icon = 'kaleidoscope-pearls';

  static upgrades = [
    { }, { }, { }
  ];

}
