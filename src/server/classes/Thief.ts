
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../models/character';

export class Thief extends BaseClass {
  static combatDamageMultiplier = 1.25;
  static combatLevelDivisor = 4;
  static willDivisor = 4;

  static becomeClass(character: Character) {
    super.becomeClass(character);
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.stats.hp += this.rollDie(`1df([con] / 3) + f([con] / 2)`, character);
    character.recalculateStats();
  }
}
