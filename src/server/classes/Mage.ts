
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../models/character';

export class Mage extends BaseClass {
  static combatDivisor = 6;

  static becomeClass(character: Character) {
    super.becomeClass(character);
    character.stats.mp = 30;
    character.recalculateStats();
    character.skills.conjuration = character.calcSkillXP(1);
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.stats.hp += this.rollDie(`1d[con]`, character);
    character.stats.mp += this.rollDie(`2d[int] + f([int] / 5)`, character);
    character.recalculateStats();
  }
}
