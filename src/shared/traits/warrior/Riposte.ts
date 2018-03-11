
import { Trait } from '../../models/trait';

export class Riposte extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Riposte';
  static description = 'Increase the chance of counter-attacking enemies by 1% per point.';
  static icon = 'sword-clash';

  static tpCost = 10;
  static maxLevel = 10;

}
