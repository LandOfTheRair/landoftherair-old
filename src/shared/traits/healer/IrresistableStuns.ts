
import { Trait } from '../../models/trait';

export class IrresistibleStuns extends Trait {

  static baseClass = 'Healer';
  static traitName = 'IrresistibleStuns';
  static description = 'Reduce your stun targets WIL by $1|3$.';
  static icon = 'knockout';

  static upgrades = [
    { requireCharacterLevel: 10 }, { }, { capstone: true }
  ];

}
