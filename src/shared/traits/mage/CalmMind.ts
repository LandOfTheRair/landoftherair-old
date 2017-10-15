
import { Trait } from '../../models/trait';

export class CalmMind extends Trait {

  static baseClass = 'Mage';
  static traitName = 'CalmMind';
  static description = 'Regenerate mana faster.';
  static icon = 'psychic-waves';

  static tpCost = 10;
  static maxLevel = 10;

}
