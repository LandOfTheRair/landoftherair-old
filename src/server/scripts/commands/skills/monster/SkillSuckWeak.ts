
import { random, sample, filter } from 'lodash';

import * as dice from 'dice.js';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/world/combat-helper';
import { VALID_TRADESKILLS_HASH } from '../../../../../shared/helpers/tradeskill-helper';

export class SkillSuckWeak extends Skill {

  name = 'skillsuckweak';
  execute() {}

  use(user: Character, target: Character) {

    // lose a tiny bit of xp
    const lostXP = random(500, 2500);
    target.gainExp(-lostXP);

    // lose a tiny bit of non-zero, non-tradeskill skills
    const skills = target.allSkills;
    const lostSkill = random(5, 10);
    const lostSkillType = sample(filter(Object.keys(skills), skill => {
      return skills[skill] > 0 && !VALID_TRADESKILLS_HASH[skill];
    }));

    target._gainSkill(lostSkillType, lostSkill);

    // do some damage
    const damage = +dice.roll(`3d${user.getTotalStat('str')}`);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `${user.name} sucked your experience and ${lostSkillType} knowledge away!`
    });
  }

}
