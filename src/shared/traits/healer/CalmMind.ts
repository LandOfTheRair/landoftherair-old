
import { Trait } from '../../models/trait';

export class CalmMind extends Trait {

  static baseClass = 'Healer';
  static traitName = 'CalmMind';
  static description = 'Gain +$2|6$ to your mana regeneration.';
  static icon = 'psychic-waves';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
