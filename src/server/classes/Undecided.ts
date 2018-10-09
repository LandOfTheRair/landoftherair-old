
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../shared/models/character';

export class Undecided extends BaseClass {
  static combatLevelDivisor = 3;
  static willDivisor = 4;

  static gainLevelStats(character: Character) {
    BaseClass.gainLevelStats(character);
    character.gainBaseStat('hp', this.rollDie(`2df([con] / 2) + f([con] / 2)`, character));
  }
}
