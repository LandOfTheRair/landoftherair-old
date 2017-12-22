
import { Trait } from '../../models/trait';

export class MagicFocus extends Trait {

  static baseClass = 'Healer';
  static traitName = 'NecroticFocus';
  static description = 'Deal more necrotic damage.';
  static icon = 'plasma-bolt';

  static tpCost = 10;
  static maxLevel = 10;

}
