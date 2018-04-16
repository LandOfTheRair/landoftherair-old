
import { Trait } from '../../models/trait';

export class ShadowRanger extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowRanger';
  static description = 'Do $10|30$% more damage while hidden.';
  static icon = 'on-sight';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

}
