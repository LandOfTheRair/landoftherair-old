
import { Trait } from '../../models/trait';

export class Riposte extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Riposte';
  static description = 'Increase the chance of counter-attacking enemies by $3|9$%.';
  static icon = 'spinning-sword';

  static upgrades = [
    { }, { }, { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 3;
  }

}
