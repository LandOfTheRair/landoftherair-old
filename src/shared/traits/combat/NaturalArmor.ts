
import { Trait } from '../../models/trait';

export class NaturalArmor extends Trait {

  static traitName: string = 'NaturalArmor';
  static description = 'Harden your skin, increasing your natural armor class.';
  static icon: string = 'armor-vest';

  static tpCost = 20;
  static maxLevel = 5;

}
