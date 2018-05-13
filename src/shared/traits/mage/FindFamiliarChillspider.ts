
import { Trait } from '../../models/trait';

export class FindFamiliarChillspider extends Trait {

  static baseClass = 'Mage';
  static traitName = 'FindFamiliarChillspider';
  static description = 'You can now summon a chillspider, which slows foes.';
  static icon = 'eagle-emblem';

  static upgrades = [
    { requireCharacterLevel: 10, capstone: true }
  ];

}
