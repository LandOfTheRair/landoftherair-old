
import { MonsterSkill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { CombatHelper } from '../../../../../helpers/world/combat-helper';
import { RollerHelper } from '../../../../../../shared/helpers/roller-helper';

export class ChillBiteFrostDragon extends MonsterSkill {

  name = 'chillbitefrostdragon';

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && !target.hasEffect('Frosted') && !target.hasEffect('RecentlyFrosted');
  }

  use(user: Character, target: Character) {
    const damage = RollerHelper.diceRoll(15, user.getTotalStat('str'));
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'ice',
      attackerDamageMessage: '',
      defenderDamageMessage: `%0 sunk cold fangs into you!`
    });
  }

}
