
import { Trait } from '../../models/trait';

export class LingeringAsper extends Trait {

  static baseClass = 'Mage';
  static traitName = 'LingeringAsper';
  static description = 'Your Asper spell also leaves a $3|9$ round EoT that continues to drain the target MP.';
  static icon = 'wind-hole';

  static upgrades = [
    { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
