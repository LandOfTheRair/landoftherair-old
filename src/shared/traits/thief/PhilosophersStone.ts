
import { Trait } from '../../models/trait';

export class PhilosophersStone extends Trait {

  static baseClass = 'Thief';
  static traitName = 'PhilosophersStone';
  static description = 'You get 10% more gold per point when you transmute items.';
  static icon = 'coins';

  static tpCost = 10;
  static maxLevel = 10;

}
