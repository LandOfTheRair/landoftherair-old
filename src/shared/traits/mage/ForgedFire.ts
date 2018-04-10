
import { Trait } from '../../models/trait';

export class ForgedFire extends Trait {

  static baseClass = 'Mage';
  static traitName = 'ForgedFire';
  static description = 'Your fire spells burn the opponent more quickly.';
  static icon = 'flame-spin';

  static upgrades = [
    { requireCharacterLevel: 10 }, { requireCharacterLevel: 10 }, { requireCharacterLevel: 10, capstone: true }
  ];

}
