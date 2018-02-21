
import { Trait } from '../../models/trait';

export class PhilosophersStone extends Trait {

  static baseClass = 'Thief';
  static traitName = 'PhilosophersStone';
  static description = 'You get more gold when you transmute items.';
  static icon = 'coins';

  static tpCost = 10;
  static maxLevel = 10;

}
