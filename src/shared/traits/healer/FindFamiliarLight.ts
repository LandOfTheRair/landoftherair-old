
import { Trait } from '../../models/trait';

export class FindFamiliarLight extends Trait {

  static baseClass = 'Healer';
  static traitName = 'FindFamiliarLight';
  static description = 'You can now summon a light spirit, which heals allies.';
  static icon = 'eagle-emblem';

  static upgrades = [
    { requireCharacterLevel: 10, capstone: true }
  ];

}
