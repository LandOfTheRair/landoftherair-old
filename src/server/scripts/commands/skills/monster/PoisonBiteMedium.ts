
import { startsWith } from 'lodash';

import * as dice from 'dice.js';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../effects/Poison';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class PoisonBiteMedium extends Skill {

  name = 'poisonbitemedium';
  execute() {}
  range = () => 0;

  use(user: Character, target: Character) {
    const damage = +dice.roll(`4d${user.getTotalStat('str')}`);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `${user.name} bit you!`
    });
    const effect = new CastEffect({ potency: 10, duration: 10 });
    effect.cast(user, target, this);
  }

}
