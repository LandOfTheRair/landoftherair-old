
import { Trait } from '../../models/trait';

export class TripleShot extends Trait {

  static baseClass = 'Thief';
  static traitName = 'TripleShot';
  static description = 'Your MultiShot spell will shoot $1|3$ more shots.';
  static icon = 'double-shot';

  static upgrades = [
    { cost: 10 }
  ];

}
