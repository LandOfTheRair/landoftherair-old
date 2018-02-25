
import { Trait } from '../../models/trait';

export class NecroticFocus extends Trait {

  static baseClass = 'Healer';
  static traitName = 'NecroticFocus';
  static description = 'Deal 4% more necrotic damage per point.';
  static icon = 'plasma-bolt';

  static tpCost = 10;
  static maxLevel = 10;

}
