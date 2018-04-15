
import { Trait } from '../../models/trait';

export class CripplingPoison extends Trait {

  static baseClass = 'Healer';
  static traitName = 'CripplingPoison';
  static description = 'Your Poison spell will also lower the attack and defense of the afflicted target.';
  static icon = 'poison-gas';

  static upgrades = [
    { cost: 25, capstone: true }
  ];

}
