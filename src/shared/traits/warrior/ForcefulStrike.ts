
import { Trait } from '../../models/trait';

export class ForcefulStrike extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'ForcefulStrike';
  static description = 'Strike more forcefully with your weapon, dealing additional damage.';
  static icon = 'striped-sword';

  static tpCost = 10;
  static maxLevel = 20;

}
