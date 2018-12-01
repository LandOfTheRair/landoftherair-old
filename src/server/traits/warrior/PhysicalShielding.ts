
import { Trait } from '../../../shared/models/trait';
import { Character } from '../../../shared/models/character';

export class PhysicalShielding extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'PhysicalShielding';
  static description = 'Increase your physical resistance by $20|60$% of your shield armor class.';
  static icon = 'bordered-shield';

  static upgrades = [
    { }, { }, { }, { }, { }
  ];

  static usageModifier(level: number, char: Character): number {
    let shieldAC = 0;
    if(char.leftHand && char.leftHand.itemClass === 'Shield') shieldAC += char.leftHand.stats.armorClass;
    if(char.rightHand && char.rightHand.itemClass === 'Shield' && char.getTraitLevel('Shieldbearer')) shieldAC += char.rightHand.stats.armorClass;
    return Math.floor(shieldAC * (100 / (level * 20)));
  }

}
