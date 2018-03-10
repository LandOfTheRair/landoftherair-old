
import { Trait } from '../../models/trait';

export class OffhandFinesse extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'OffhandFinesse';
  static description = 'Increase your offhand attack damage by 10% per point.';
  static icon = 'crossed-sabres';

  static tpCost = 15;
  static maxLevel = 15;

}
