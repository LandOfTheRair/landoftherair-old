
import { Trait } from '../../models/trait';

export class EnhancedApplications extends Trait {

  static baseClass = 'Thief';
  static traitName = 'EnhancedApplications';
  static description = 'Your applications last $60|180$ seconds longer.';
  static icon = 'bloody-sword';

  static upgrades = [
    { cost: 30, capstone: true }
  ];

}
