
import { Trait } from '../../models/trait';

export class FindFamiliarSalamander extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FindFamiliarSalamander';
  static description = 'You can now summon a salamander, which has the ability to cast fire.';
  static icon = 'eagle-emblem';

  static upgrades = [
    { requireCharacterLevel: 10, capstone: true }
  ];

}
