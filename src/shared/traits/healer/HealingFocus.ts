
import { Trait } from '../../models/trait';

export class HealingFocus extends Trait {

  static baseClass = 'Healer';
  static traitName: string = 'HealingFocus';
  static description = 'Heal more health when you use restorative magic.';
  static icon: string = 'health-increase';

  static tpCost = 10;
  static maxLevel = 10;

}
