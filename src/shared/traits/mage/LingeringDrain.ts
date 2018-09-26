
import { Trait } from '../../models/trait';

export class LingeringDrain extends Trait {

  static baseClass = 'Mage';
  static traitName = 'LingeringDrain';
  static description = 'Your Drain spell also leaves a $3|9$ round EoT that continues to drain the target HP.';
  static icon = 'wind-hole';

  static upgrades = [
    { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
