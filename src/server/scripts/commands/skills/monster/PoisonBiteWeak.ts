
import { startsWith } from 'lodash';

import * as dice from 'dice.js';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../effects/dots/Poison';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class PoisonBiteWeak extends Skill {

  name = 'poisonbiteweak';
  execute() {}
  range = () => 0;

  use(user: Character, target: Character) {
    const damage = +dice.roll(`2d${user.getTotalStat('str')}`);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `${user.name} bit you!`
    });
    const effect = new CastEffect({ potency: 7, duration: 10 });
    effect.cast(user, target, this);
  }

}
