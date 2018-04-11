
import { Trait } from '../../models/trait';

export class DeathGrip extends Trait {

  static traitName = 'DeathGrip';
  static description = 'Decrease your chance of dropping items on death by 5% per point.';
  static icon = 'drop-weapon';

  static upgrades = [
    { }, { }, { requireCharacterLevel: 15, capstone: true }
  ];

}
