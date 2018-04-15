
import { Trait } from '../../models/trait';

export class HolyIllumination extends Trait {

  static baseClass = 'Healer';
  static traitName = 'HolyIllumination';
  static description = 'Your HolyFire spell will cast light on the enemy it hits.';
  static icon = 'fireflake';

  static upgrades = [
    { cost: 20 }
  ];

}
