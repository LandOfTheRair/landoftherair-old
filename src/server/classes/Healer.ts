
import { BaseClass } from '../base/BaseClass';
import { Character, SkillClassNames } from '../../models/character';

export class Healer extends BaseClass {
  static combatDivisor = 5;
  static willDivisor = 3;

  static becomeClass(character: Character) {
    super.becomeClass(character);
    character.stats.mp = 30;
    character.recalculateStats();
    character._gainSkill(SkillClassNames.Restoration, character.calcSkillXP(1));
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.stats.hp += this.rollDie(`f([con] / 5)d3 + f([con] / 3)`, character);
    character.stats.mp += this.rollDie(`1d[wis] + f([wis] / 3)`, character);
    character.recalculateStats();
  }
}
