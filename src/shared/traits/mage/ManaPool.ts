
import { Trait } from '../../models/trait';

export class ManaPool extends Trait {

  static baseClass = 'Mage';
  static traitName = 'ManaPool';
  static description = 'Gain +$10|30$ additional mana.';
  static icon = 'drink-me';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
