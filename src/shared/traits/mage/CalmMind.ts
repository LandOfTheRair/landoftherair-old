
import { Trait } from '../../models/trait';

export class CalmMind extends Trait {

  static baseClass = 'Mage';
  static traitName: string = 'CalmMind';
  static description = 'Regenerate mana faster.';
  static icon: string = 'psychic-waves';

  static tpCost = 10;
  static maxLevel = 10;

}
