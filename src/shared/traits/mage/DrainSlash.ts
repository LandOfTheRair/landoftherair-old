
import { Trait } from '../../models/trait';

export class DrainSlash extends Trait {

  static baseClass = 'Mage';
  static traitName = 'DrainSlash';
  static description = 'You have a $5|15$% chance of casting Drain on your melee target when using Rift Slash.';
  static icon = 'running-ninja';

  static upgrades = [
    { cost: 20, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 5;
  }

}
