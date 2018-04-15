
import { Trait } from '../../models/trait';

export class ImprovedAutoheal extends Trait {

  static baseClass = 'Healer';
  static traitName = 'ImprovedAutoheal';
  static description = 'Your Autoheal spell will consume fewer charges and trigger at a higher percent.';
  static icon = 'self-love';

  static upgrades = [
    { cost: 50, capstone: true }
  ];

}
