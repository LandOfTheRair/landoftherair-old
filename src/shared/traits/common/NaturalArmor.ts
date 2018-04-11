
import { Trait } from '../../models/trait';

export class NaturalArmor extends Trait {

  static traitName = 'NaturalArmor';
  static description = 'Harden your skin, increasing your natural armor class by 2 per point.';
  static icon = 'armor-vest';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
