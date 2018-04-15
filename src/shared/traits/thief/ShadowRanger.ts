
import { Trait } from '../../models/trait';

export class ShadowRanger extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowRanger';
  static description = 'Do 10% more damage while hidden per point.';
  static icon = 'on-sight';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

}
