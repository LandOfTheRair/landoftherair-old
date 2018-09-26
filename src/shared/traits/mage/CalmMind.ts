
import { Trait } from '../../models/trait';

export class CalmMind extends Trait {

  static baseClass = 'Mage';
  static traitName = 'CalmMind';
  static description = 'Gain +$2|6$ to your mana regeneration per point.';
  static icon = 'psychic-waves';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 2;
  }

}
