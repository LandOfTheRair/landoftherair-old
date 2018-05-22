
import { Trait } from '../../models/trait';

export class FindFamiliarWater extends Trait {

  static baseClass = 'Healer';
  static traitName = 'FindFamiliarWater';
  static description = 'You can now summon a water spirit, which supports allies.';
  static icon = 'eagle-emblem';

  static upgrades = [
    { requireCharacterLevel: 10, capstone: true }
  ];

}
