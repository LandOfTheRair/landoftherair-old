
import { Trait } from '../../models/trait';

export class ShadowDaggers extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowDaggers';
  static description = 'Some of your plain melee attacks turn into backstabs.';
  static icon = 'daggers';

  static tpCost = 10;
  static maxLevel = 10;

}
