
import { Trait } from '../../models/trait';

export class ForcefulStrike extends Trait {

  static baseClass = 'Warrior';
  static traitName: string = 'ForcefulStrike';
  static description = 'Strike more forcefully with your weapon, dealing additional damage.';
  static icon: string = 'striped-sword';

  static tpCost = 10;
  static maxLevel = 20;

}
