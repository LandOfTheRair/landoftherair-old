
import { Trait } from '../../models/trait';

export class ReusableTraps extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ReusableTraps';
  static description = 'Your traps can be triggered $1|3$ more time(s).';
  static icon = 'regeneration';

  static upgrades = [
    { cost: 15 }, { cost: 15 }
  ];

}
