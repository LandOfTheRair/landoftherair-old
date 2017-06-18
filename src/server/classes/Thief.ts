
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../models/character';

export class Thief extends BaseClass {
  static becomeClass(character: Character) {
    super.becomeClass(character);
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.hp.maximum += this.rollDie(`1df([con] / 3) + f([con] / 2)`, character);
  }
}
