
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../models/character';

export class Healer extends BaseClass {
  static becomeClass(character: Character) {
    super.becomeClass(character);
    character.mp.maximum = 30;
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.hp.maximum += this.rollDie(`f([con] / 5)d3 + f([con] / 3)`, character);
    character.mp.maximum += this.rollDie(`1d[wis] + f([wis] / 3)`, character);
  }
}
