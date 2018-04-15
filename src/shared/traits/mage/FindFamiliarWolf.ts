
import { Trait } from '../../models/trait';

export class FindFamiliarWolf extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FindFamiliarWolf';
  static description = 'You can now summon a wolf, which can do strong physical attacks.';
  static icon = 'eagle-emblem';

  static upgrades = [
    { requireCharacterLevel: 10, capstone: true }
  ];

}
