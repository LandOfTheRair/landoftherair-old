


import { MonsterSkill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/world/combat-helper';

export class ShredTwentyPercent extends MonsterSkill {

  name = 'shredtwentypercent';

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && target.hp.gtePercent(60) && !target.hasEffect('Dangerous');
  }

  use(user: Character, target: Character) {
    const damage = Math.floor(target.getTotalStat('hp') / 5);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `%0 shreds your flesh!`
    });
  }

}
