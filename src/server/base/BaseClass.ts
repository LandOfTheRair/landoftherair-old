
import { Character } from '../../shared/models/character';
import * as dice from 'dice.js';

export class BaseClass {
  static becomeClass(character: Character) {
  }

  static rollDie(roll: string, character: Character) {
    return +dice.roll(roll, character.sumStats);
  }

  static gainLevelStats(character: Character) {
  }

  static calcBonusStatsForCharacter(character: Character): any {
    return {};
  }
}
