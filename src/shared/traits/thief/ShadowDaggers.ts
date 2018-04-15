
import { Trait } from '../../models/trait';

export class ShadowDaggers extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowDaggers';
  static description = 'Your plain melee attacks turn into backstabs 1% of the time per point.';
  static icon = 'daggers';

  static upgrades = [
    { }, { }, { capstone: true }
  ];
}
