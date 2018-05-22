
import { Trait } from '../../models/trait';

export class FindFamiliarNature extends Trait {

  static baseClass = 'Healer';
  static traitName = 'FindFamiliarNature';
  static description = 'You can now summon a nature spirit, which debuffs foes.';
  static icon = 'eagle-emblem';

  static upgrades = [
    { requireCharacterLevel: 10, capstone: true }
  ];

}
