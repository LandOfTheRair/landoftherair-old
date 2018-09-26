
import { Trait } from '../../models/trait';

export class RecuperatingDebilitation extends Trait {

  static baseClass = 'Thief';
  static traitName = 'RecuperatingDebilitation';
  static description = 'Your Debilitate spell will cool down $5|15$s faster.';
  static icon = 'one-eyed';

  static upgrades = [
    { }, { }, { }, { cost: 30, capstone: true }
  ];

  static usageModifier(level: number): number {
    return level * 5;
  }

}
