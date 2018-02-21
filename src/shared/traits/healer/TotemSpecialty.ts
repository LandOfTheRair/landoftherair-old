
import { Trait } from '../../models/trait';

export class TotemSpecialty extends Trait {

  static baseClass = 'Healer';
  static traitName = 'WandSpecialty';
  static description = 'Spells cost 2% less per point to cast while holding a totem in your right hand.';
  static icon = 'grapple';

  static tpCost = 20;
  static maxLevel = 5;

}
