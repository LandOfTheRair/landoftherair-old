
import { Trait } from '../../models/trait';

export class ThrownTraps extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ThrownTraps';
  static description = 'You can now set traps $2|6$ tiles farther away.';
  static icon = 'beveled-star';

  static upgrades = [
    { cost: 15 }
  ];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
