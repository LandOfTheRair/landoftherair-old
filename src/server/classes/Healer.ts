
import { BaseClass } from '../base/BaseClass';
import { Character, SkillClassNames } from '../../models/character';

export class Healer extends BaseClass {
  static combatDamageMultiplier = 1;
  static combatLevelDivisor = 5;
  static willDivisor = 3;

  static becomeClass(character: Character) {
    super.becomeClass(character);

    if(!character.getBaseStat('mp')) {
      character.gainBaseStat('mp', 30);
      character._gainSkill(SkillClassNames.Restoration, character.calcSkillXP(1));
    }
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.gainBaseStat('hp', this.rollDie(`f([con] / 5)d3 + f([con] / 3)`, character));
    character.gainBaseStat('mp', this.rollDie(`1d[wis] + f([wis] / 3)`, character));
  }
}
