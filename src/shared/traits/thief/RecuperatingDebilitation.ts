
import { Trait } from '../../models/trait';

export class RecuperatingDebilitation extends Trait {

  static baseClass = 'Thief';
  static traitName = 'RecuperatingDebilitation';
  static description = 'Your Debilitate spell will cool down 5s faster per point.';
  static icon = 'one-eyed';

  static upgrades = [
    { }, { }, { }, { cost: 25, capstone: true }
  ];

}
