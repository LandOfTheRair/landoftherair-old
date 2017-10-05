
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../models/character';

export class Undecided extends BaseClass {
  static combatDamageMultiplier = 1;
  static combatLevelDivisor = 3;
  static willDivisor = 4;

  static becomeClass(character: Character) {

  }
}
