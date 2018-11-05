
import { BaseClass } from '../base/BaseClass';
import { ICharacter } from '../../shared/interfaces/character';

export class Warrior extends BaseClass {
  static combatLevelDivisor = 2;
  static willDivisor = 4;

  static becomeClass(character: ICharacter) {
    BaseClass.becomeClass(character);
  }

  static gainLevelStats(character: ICharacter) {
    BaseClass.gainLevelStats(character);
    character.gainBaseStat('hp', this.rollDie(`2df([con] / 3) + f([con] / 3)`, character));
  }

  /** PERK:CLASS:WARRIOR:Warriors gain 5 mitigation always. */
  /** PERK:CLASS:WARRIOR:Warriors gain 1 offense and 1 defense every 5 levels. */
  /** PERK:CLASS:WARRIOR:Warriors gain 1 weapon AC every 3 levels. */
  static calcBonusStatsForCharacter(character: ICharacter): any {
    const statLevel = Math.floor(character.level / 5);
    const weaponAC = Math.floor(character.level / 3);

    return { offense: statLevel, defense: statLevel, weaponArmorClass: weaponAC, mitigation: 5 };
  }
}
