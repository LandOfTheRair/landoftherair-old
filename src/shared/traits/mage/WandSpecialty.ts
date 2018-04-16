
import { Trait } from '../../models/trait';

export class WandSpecialty extends Trait {

  static baseClass = 'Mage';
  static traitName = 'WandSpecialty';
  static description = 'Spells cost $2|6$% less per point to cast while holding a wand in your right hand.';
  static icon = 'fairy-wand';

  static upgrades = [
    { requireCharacterLevel: 10 }, { requireCharacterLevel: 10 }, { requireCharacterLevel: 15, capstone: true }
  ];

}
