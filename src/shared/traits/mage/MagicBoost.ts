
import { Trait } from '../../models/trait';

export class MagicBoost extends Trait {

  static baseClass = 'Mage';
  static traitName: string = 'MagicBoost';
  static description = 'Gain additional mana.';
  static icon: string = 'drink-me';

  static tpCost = 1;
  static maxLevel = 100;

}
