

import * as dice from 'dice.js';

import { MonsterSkill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/world/combat-helper';
import { RollerHelper } from '../../../../../shared/helpers/roller-helper';

export class SkillSuckWeak extends MonsterSkill {

  name = 'skillsuckweak';

  use(user: Character, target: Character) {

    // lose a tiny bit of xp
    target.loseExpOrSkill({ lostXPMin: 500, lostXPMax: 2500, lostSkillMin: 5, lostSkillMax: 10 });

    // do some damage
    const damage = RollerHelper.diceRoll(3, user.getTotalStat('str'));
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `%0 sucked your experience and knowledge away!`
    });
  }

}
