
import { BaseClass } from '../base/BaseClass';
import { ICharacter } from '../../shared/interfaces/character';

export class Thief extends BaseClass {
  static combatLevelDivisor = 2.5;
  static willDivisor = 4;

  static becomeClass(character: ICharacter) {
    BaseClass.becomeClass(character);
  }

  static gainLevelStats(character: ICharacter) {
    BaseClass.gainLevelStats(character);
    character.gainBaseStat('hp', this.rollDie(`1df([con] / 3) + f([con] / 2)`, character));
  }
}
