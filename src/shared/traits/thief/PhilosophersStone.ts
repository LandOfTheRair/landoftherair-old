
import { Trait } from '../../models/trait';

export class PhilosophersStone extends Trait {

  static baseClass = 'Thief';
  static traitName = 'PhilosophersStone';
  static description = 'You get $10|30$% more gold when you transmute items.';
  static icon = 'coins';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
