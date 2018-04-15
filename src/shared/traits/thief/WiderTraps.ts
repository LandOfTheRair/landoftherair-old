
import { Trait } from '../../models/trait';

export class WiderTraps extends Trait {

  static baseClass = 'Thief';
  static traitName = 'WiderTraps';
  static description = 'Your area of effect traps are wider.';
  static icon = 'kaleidoscope-pearls';

  static upgrades = [
    { }, { }, { }
  ];

}
