
import { Trait } from '../../models/trait';

export class Swashbuckler extends Trait {

  static baseClass = 'Warrior';
  static traitName = 'Swashbuckler';
  static description = 'Reduce your chance of getting a glancing blow.';
  static icon = 'spiral-thrust';

  static upgrades = [
    { }, { }, { }, { }, { capstone: true }
  ];

}
