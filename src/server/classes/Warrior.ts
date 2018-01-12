
import { BaseClass } from '../base/BaseClass';
import { Character } from '../../shared/models/character';

export class Warrior extends BaseClass {
  static combatDamageMultiplier = 1.5;
  static combatLevelDivisor = 2;
  static willDivisor = 4;

  static becomeClass(character: Character) {
    super.becomeClass(character);
  }

  static gainLevelStats(character: Character) {
    super.gainLevelStats(character);
    character.gainBaseStat('hp', this.rollDie(`2df([con] / 3) + f([con] / 3)`, character));
  }

  static calcBonusStatsForCharacter(character: Character): any {
    const statLevel = Math.floor(character.level / 5);
    const weaponAC = Math.floor(character.level / 2);

    return { offense: statLevel, defense: statLevel, weaponArmorClass: weaponAC };
  }
}
