
import { Trait } from '../../models/trait';

export class IrresistibleStuns extends Trait {

  static baseClass = 'Healer';
  static traitName = 'IrresistibleStuns';
  static description = 'Reduce your stun targets WIL by 1 per pt.';
  static icon = 'knockout';

  static tpCost = 20;
  static maxLevel = 5;

}
