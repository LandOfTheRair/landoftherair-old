
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../models/character';

export class Warrior extends BaseClass {
  static combatDivisor = 3;
  static willDivisor = 4;

  static becomeClass(character: Character) {
    super.becomeClass(character);
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.stats.hp += this.rollDie(`2df([con] / 3) + f([con] / 3)`, character);
    character.recalculateStats();
  }
}
