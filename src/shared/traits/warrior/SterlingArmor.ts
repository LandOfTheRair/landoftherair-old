
import { Trait } from '../../models/trait';

export class SterlingArmor extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'SterlingArmor';
  static description = 'Increase your chance of ignoring incoming glancing blows.';
  static icon = 'chest-armor';

  static upgrades = [
    { }, { }, { }, { }, { capstone: true }
  ];

}
