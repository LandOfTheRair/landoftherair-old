
import { Trait } from '../../models/trait';

export class ShadowSwap extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowSwap';
  static description = 'Swap places with your shadow in combat $2|6$% more frequently.';
  static icon = 'shadow-follower';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { }, { capstone: true }
  ];

}
