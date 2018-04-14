
import { Trait } from '../../models/trait';

export class ReusableTraps extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ReusableTraps';
  static description = 'Your traps can be triggered 1 more time per point.';
  static icon = 'regeneration';

  static upgrades = [
    { cost: 15 }, { cost: 15 }
  ];

}
