
import { Trait } from '../../models/trait';

export class NaturalArmor extends Trait {

  static traitName = 'NaturalArmor';
  static description = 'Harden your skin, increasing your natural armor class.';
  static icon = 'armor-vest';

  static tpCost = 20;
  static maxLevel = 5;

}
