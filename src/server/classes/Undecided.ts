
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../shared/models/character';

export class Undecided extends BaseClass {
  static combatLevelDivisor = 3;
  static willDivisor = 4;

  static becomeClass(character: Character) {

  }
}
