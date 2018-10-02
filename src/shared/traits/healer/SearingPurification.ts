
import { Trait } from '../../models/trait';

export class SearingPurification extends Trait {

  static baseClass = 'Healer';
  static traitName = 'SearingPurification';
  static description = 'Your HolyFire spell will cause the target to lose 2% MP and take fire damage for 5 seconds.';
  static icon = 'fireflake';

  static upgrades = [
    { cost: 10 }
  ];

}
