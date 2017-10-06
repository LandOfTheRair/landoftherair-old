
import { BaseClass } from '../base/BaseClass';
import { Character, SkillClassNames } from '../../models/character';

export class Mage extends BaseClass {
  static combatDamageMultiplier = 0.85;
  static combatLevelDivisor = 5;
  static willDivisor = 3;

  static becomeClass(character: Character) {
    super.becomeClass(character);

    if(!character.getBaseStat('mp')) {
      character.gainBaseStat('mp', 30);
      character._gainSkill(SkillClassNames.Conjuration, character.calcSkillXP(1));
    }
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.gainBaseStat('hp', this.rollDie(`1d[con]`, character));
    character.gainBaseStat('mp', this.rollDie(`2d[int] + f([int] / 5)`, character));
  }
}
