
import { Trait } from '../../models/trait';

export class LockpickSpecialty extends Trait {

  static baseClass = 'Thief';
  static traitName = 'LockpickSpecialty';
  static description = 'Your lockpicking ability is slightly increased.';
  static icon = 'unlocking';

  static upgrades = [
    { cost: 5 }, { cost: 5 }, { cost: 5 }, { cost: 5 }, { cost: 5 }
  ];

}
