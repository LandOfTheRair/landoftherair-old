
import { Trait } from '../../models/trait';

export class DeathGrip extends Trait {

  static traitName = 'DeathGrip';
  static description = 'Decrease your chance of dropping items on death.';
  static icon = 'drop-weapon';

  static tpCost = 20;
  static maxLevel = 20;

}
