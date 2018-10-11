


import * as dice from 'dice.js';

import { MonsterSkill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../effects/dots/Poison';
import { CombatHelper } from '../../../../helpers/world/combat-helper';
import { RollerHelper } from '../../../../../shared/helpers/roller-helper';

export class PoisonBiteStrong extends MonsterSkill {

  name = 'poisonbitestrong';

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && !target.hasEffect('Poison');
  }

  use(user: Character, target: Character) {
    const damage = RollerHelper.diceRoll(6, user.getTotalStat('str'));
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `%0 bit you!`
    });
    const effect = new CastEffect({ potency: 20, duration: 10 });
    effect.cast(user, target, this);
  }

}
