
import { Trait } from '../../models/trait';

export class ManaPool extends Trait {

  static baseClass = 'Mage';
  static traitName = 'ManaPool';
  static description = 'Gain additional mana.';
  static icon = 'drink-me';

  static tpCost = 1;
  static maxLevel = 100;

}
