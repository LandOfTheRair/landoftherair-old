


import { MonsterSkill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/world/combat-helper';

export class ShredTenPercent extends MonsterSkill {

  name = 'shredtenpercent';

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && target.hp.gtePercent(50);
  }

  use(user: Character, target: Character) {
    const damage = Math.floor(target.getTotalStat('hp') / 10);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `${user.name} shreds your flesh!`
    });
  }

}
