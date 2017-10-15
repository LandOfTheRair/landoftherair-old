
import { Trait } from '../../models/trait';

export class SwordTricks extends Trait {

  static traitName = 'SwordTricks';
  static description = 'Learn some new sword tricks, increasing your offensive capabilities.';
  static icon = 'sword-clash';

  static tpCost = 20;
  static maxLevel = 5;

}
