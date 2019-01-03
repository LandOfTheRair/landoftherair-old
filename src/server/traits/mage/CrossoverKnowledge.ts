
import { Trait } from '../../../shared/models/trait';

export class CrossoverKnowledge extends Trait {

  static baseClass = 'Mage';
  static traitName = 'CrossoverKnowledge';
  static description = 'Half of your weapon skill will apply to your magical skills as well.';
  static icon = 'rune-sword';

  static upgrades = [
    { capstone: true, cost: 15 }
  ];

}
