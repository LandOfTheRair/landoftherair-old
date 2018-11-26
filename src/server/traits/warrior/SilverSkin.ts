
import { Trait } from '../../../shared/models/trait';

export class SilverSkin extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'SilverSkin';
  static description = 'Decrease the amount of physical damage you take by $10|30$.';
  static icon = 'leg-armor';

  static upgrades = [
    { }, { }, { }, { }, { capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 10;
  }

}
