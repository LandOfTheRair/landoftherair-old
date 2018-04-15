
import { Trait } from '../../models/trait';

export class FindFamiliarBear extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FindFamiliarBear';
  static description = 'You can now summon a bear, which has a lot of HP.';
  static icon = 'eagle-emblem';

  static upgrades = [
    { requireCharacterLevel: 10, capstone: true }
  ];

}
