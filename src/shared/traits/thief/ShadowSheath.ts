
import { Trait } from '../../models/trait';

export class ShadowSheath extends Trait {

  static baseClass = 'Thief';
  static traitName = 'ShadowSheath';
  static description = 'Your weapons are $2|6$% easier to conceal.';
  static icon = 'thrown-knife';

  static upgrades = [
    { }, { }, { }, { }, { }, { }, { capstone: true }
  ];

}
