
import * as dice from 'dice.js';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../effects/dots/Poison';
import { CombatHelper } from '../../../../helpers/world/combat-helper';

export class ChillBiteStrong extends Skill {

  name = 'chillbitestrong';
  execute() {}

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && !target.hasEffect('Frosted');
  }

  use(user: Character, target: Character) {
    const damage = +dice.roll(`6d${user.getTotalStat('str')}`);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'ice',
      attackerDamageMessage: '',
      defenderDamageMessage: `${user.name} sunk cold fangs into you!`
    });
    const effect = new CastEffect({ potency: 6, duration: 15 });
    effect.cast(user, target, this);
  }

}
