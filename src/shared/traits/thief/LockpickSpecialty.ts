
import { Trait } from '../../models/trait';

export class LockpickSpecialty extends Trait {

  static baseClass = 'Thief';
  static traitName = 'LockpickSpecialty';
  static description = 'Your lockpicking ability is increased by $1|3$ skill per point.';
  static icon = 'unlocking';

  static upgrades = [
    { cost: 5 }, { cost: 5 }, { cost: 5 }, { cost: 5 }, { cost: 5 }
  ];

}
