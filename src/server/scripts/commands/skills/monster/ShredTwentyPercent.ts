


import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { CombatHelper } from '../../../../helpers/world/combat-helper';

export class ShredTwentyPercent extends Skill {

  name = 'shredtwentypercent';
  execute() {}

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && target.hp.gtePercent(60);
  }

  use(user: Character, target: Character) {
    const damage = Math.floor(target.hp.maximum / 5);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `${user.name} shreds your flesh!`
    });
  }

}
