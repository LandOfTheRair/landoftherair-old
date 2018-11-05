
import { BaseClass } from '../base/BaseClass';
import { ICharacter } from '../../shared/interfaces/character';

export class Undecided extends BaseClass {
  static combatLevelDivisor = 3;
  static willDivisor = 4;

  static gainLevelStats(character: ICharacter) {
    BaseClass.gainLevelStats(character);
    character.gainBaseStat('hp', this.rollDie(`2df([con] / 2) + f([con] / 2)`, character));
  }
}
