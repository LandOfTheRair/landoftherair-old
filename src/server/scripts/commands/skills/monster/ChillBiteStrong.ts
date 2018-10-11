
import * as dice from 'dice.js';

import { MonsterSkill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../effects/dots/Poison';
import { CombatHelper } from '../../../../helpers/world/combat-helper';

export class ChillBiteStrong extends MonsterSkill {

  name = 'chillbitestrong';

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && !target.hasEffect('Frosted');
  }

  use(user: Character, target: Character) {
    const damage = +dice.roll(`6d${user.getTotalStat('str')}`);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'ice',
      attackerDamageMessage: '',
      defenderDamageMessage: `%0 sunk cold fangs into you!`
    });
    const effect = new CastEffect({ potency: 6, duration: 15 });
    effect.cast(user, target, this);
  }

}
