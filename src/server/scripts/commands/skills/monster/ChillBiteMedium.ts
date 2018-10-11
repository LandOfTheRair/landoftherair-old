
import { MonsterSkill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../effects/dots/Poison';
import { CombatHelper } from '../../../../helpers/world/combat-helper';
import { RollerHelper } from '../../../../../shared/helpers/roller-helper';

export class ChillBiteMedium extends MonsterSkill {

  name = 'chillbitemedium';

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && !target.hasEffect('Frosted');
  }

  use(user: Character, target: Character) {
    const damage = RollerHelper.diceRoll(4, user.getTotalStat('str'));
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'ice',
      attackerDamageMessage: '',
      defenderDamageMessage: `%0 sunk cold fangs into you!`
    });
    const effect = new CastEffect({ potency: 4, duration: 10 });
    effect.cast(user, target, this);
  }

}
