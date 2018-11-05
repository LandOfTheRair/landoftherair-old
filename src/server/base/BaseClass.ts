
import * as dice from 'dice.js';
import { ICharacter } from '../../shared/interfaces/character';

export class BaseClass {
  static becomeClass(character: ICharacter) {
  }

  static rollDie(roll: string, character: ICharacter) {
    return +dice.roll(roll, character.sumStats);
  }

  static gainLevelStats(character: ICharacter) {
  }

  static calcBonusStatsForCharacter(character: ICharacter): any {
    return {};
  }
}
