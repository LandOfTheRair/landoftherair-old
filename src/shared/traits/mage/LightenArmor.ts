
import { Trait } from '../../models/trait';

export class LightenArmor extends Trait {

  static baseClass = 'Mage';
  static traitName = 'LightenArmor';
  static description = 'Your armor no longer hinders your spellcasting.';
  static icon = 'kevlar';

  static upgrades = [
    { cost: 70, requireCharacterLevel: 15, capstone: true }
  ];

}
