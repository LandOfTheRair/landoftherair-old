
import { startsWith } from 'lodash';

import * as dice from 'dice.js';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Disease as CastEffect } from '../../../../effects/Disease';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class DiseaseBiteWeak extends Skill {

  name = 'diseasebiteweak';
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
    const effect = new CastEffect({ potency: 2, duration: 10 });
    effect.cast(user, target, this);
  }

}
