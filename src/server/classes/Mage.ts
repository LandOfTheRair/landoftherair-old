
import { BaseClass } from '../base/BaseClass';
import { SkillHelper } from '../helpers/character/skill-helper';
import { ICharacter, SkillClassNames } from '../../shared/interfaces/character';

export class Mage extends BaseClass {
  static combatLevelDivisor = 3.5;
  static willDivisor = 3;

  static becomeClass(character: ICharacter) {
    BaseClass.becomeClass(character);

    if(!character.getBaseStat('mp')) {
      character.gainBaseStat('mp', 30);
      character._gainSkill(SkillClassNames.Conjuration, SkillHelper.calcSkillXP(0));
    }
  }

  static gainLevelStats(character: ICharacter) {
    BaseClass.gainLevelStats(character);
    character.gainBaseStat('hp', this.rollDie(`1d[con]`, character));
    character.gainBaseStat('mp', this.rollDie(`2d[int] + f([int] / 5)`, character));
  }
}
