
import { Character } from '../../models/character';
import * as dice from 'dice.js';

export class BaseClass {
  static becomeClass(character: Character) {
  }

  static rollDie(roll: string, character: Character) {
    return +dice.roll(roll, character.baseStats);
  }

  static gainLevelStats(character: Character) {
  }
}
