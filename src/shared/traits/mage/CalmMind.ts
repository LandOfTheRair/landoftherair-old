
import { Trait } from '../../models/trait';

export class CalmMind extends Trait {

  static baseClass = 'Mage';
  static traitName = 'CalmMind';
  static description = 'Gain +2 to your mana regeneration per point.';
  static icon = 'psychic-waves';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
