
import { Trait } from '../../models/trait';

export class GlacierStanceImproved extends Trait {

  static baseClass = 'Mage';
  static traitName = 'GlacierStanceImproved';
  static description = 'Do $10|30$% more ice damage per physical hit (while resisting that much more ice damage) while in Glacier stance.';
  static icon = 'frozen-orb';

  static upgrades = [
    { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 0.1;
  }

}
