
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../models/character';

export class Mage extends BaseClass {
  static becomeClass(character: Character) {
    super.becomeClass(character);
    character.mp.maximum = 30;
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.hp.maximum += this.rollDie(`1d[con]`, character);
    character.mp.maximum += this.rollDie(`2d[int] + f([int] / 5)`, character);
  }
}
