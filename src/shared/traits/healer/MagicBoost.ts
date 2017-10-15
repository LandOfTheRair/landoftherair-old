
import { Trait } from '../../models/trait';

export class MagicBoost extends Trait {

  static baseClass = 'Healer';
  static traitName = 'MagicBoost';
  static description = 'Gain additional mana.';
  static icon = 'drink-me';

  static tpCost = 1;
  static maxLevel = 100;

}
