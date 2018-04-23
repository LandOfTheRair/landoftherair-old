
import { Trait } from '../../models/trait';

export class VolcanoStanceImproved extends Trait {

  static baseClass = 'Mage';
  static traitName = 'VolcanoStanceImproved';
  static description = 'Do $10|30$% more fire damage (while resisting $10|30$% more fire damage) while in Volcano stance.';
  static icon = 'fire-silhouette';

  static upgrades = [
    { }, { capstone: true }
  ];

}
