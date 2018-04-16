
import { Trait } from '../../models/trait';

export class NecroticFocus extends Trait {

  static baseClass = 'Healer';
  static traitName = 'NecroticFocus';
  static description = 'Deal $10|30$% more necrotic damage per point.';
  static icon = 'plasma-bolt';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
