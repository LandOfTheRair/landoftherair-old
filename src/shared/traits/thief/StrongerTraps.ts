
import { Trait } from '../../models/trait';

export class StrongerTraps extends Trait {

  static baseClass = 'Thief';
  static traitName = 'StrongerTraps';
  static description = 'Your traps deal more damage.';
  static icon = 'beveled-star';

  static upgrades = [
    { }, { }, { }
  ];

  static usageModifier(level: number): number {
    return level * 5;
  }

}
