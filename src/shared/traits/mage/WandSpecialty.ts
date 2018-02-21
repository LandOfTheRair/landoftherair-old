
import { Trait } from '../../models/trait';

export class WandSpecialty extends Trait {

  static baseClass = 'Mage';
  static traitName = 'WandSpecialty';
  static description = 'Spells cost 2% less per point to cast while holding a wand in your right hand.';
  static icon = 'fairy-wand';

  static tpCost = 20;
  static maxLevel = 5;

}
