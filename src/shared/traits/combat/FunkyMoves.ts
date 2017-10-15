
import { Trait } from '../../models/trait';

export class FunkyMoves extends Trait {

  static traitName: string = 'FunkyMoves';
  static description = 'Learn to dance better, increasing your evasion.';
  static icon: string = 'wingfoot';

  static tpCost = 20;
  static maxLevel = 5;

}
