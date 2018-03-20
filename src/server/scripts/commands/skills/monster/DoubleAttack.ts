

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/world/combat-helper';

export class DoubleAttack extends Skill {

  name = 'doubleattack';
  execute() {}

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range();
  }

  use(user: Character, target: Character) {
    CombatHelper.physicalAttack(user, target, { attackRange: this.range(user) });
    CombatHelper.physicalAttack(user, target, { attackRange: this.range(user) });
  }

}
