
import { Trait } from '../../models/trait';

export class ForgedFire extends Trait {

  static baseClass = 'Mage';
  static traitName = 'ForgedFire';
  static description = 'Your fire spells burn the opponent more quickly.';
  static icon = 'flame-spin';

  static tpCost = 20;
  static maxLevel = 5;

}
