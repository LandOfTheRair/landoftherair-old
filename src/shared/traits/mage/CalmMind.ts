
import { Trait } from '../../models/trait';

export class CalmMind extends Trait {

  static baseClass = 'Mage';
  static traitName = 'CalmMind';
  static description = 'Gain +1 to your mana regeneration per point.';
  static icon = 'psychic-waves';

  static tpCost = 10;
  static maxLevel = 10;

}
