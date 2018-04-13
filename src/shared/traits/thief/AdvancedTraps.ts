
import { Trait } from '../../models/trait';

export class AdvancedTraps extends Trait {

  static baseClass = 'Thief';
  static traitName = 'AdvancedTraps';
  static description = 'You can buy advanced traps from the thief vendors.';
  static icon = 'log';

  static upgrades = [
    { cost: 30, capstone: true }
  ];

}
