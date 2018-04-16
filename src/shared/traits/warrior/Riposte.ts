
import { Trait } from '../../models/trait';

export class Riposte extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Riposte';
  static description = 'Increase the chance of counter-attacking enemies by $2|6$% per point.';
  static icon = 'spinning-sword';

  static upgrades = [
    { }, { }, { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
