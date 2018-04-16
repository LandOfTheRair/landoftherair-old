
import { Trait } from '../../models/trait';

export class GlacierStanceImproved extends Trait {

  static baseClass = 'Mage';
  static traitName = 'GlacierStanceImproved';
  static description = 'Do $10|30$% more ice damage while in Glacier stance.';
  static icon = 'frozen-orb';

  static upgrades = [
    { }, { capstone: true }
  ];

}
