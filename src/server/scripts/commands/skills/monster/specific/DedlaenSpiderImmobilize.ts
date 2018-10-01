

import { MonsterSkill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Immobilize } from '../../../../../effects/antibuffs/Immobilize';

export class DedlaenSpiderImmobilize extends MonsterSkill {

  name = 'dedlaenspiderimmobilize';
  range(attacker: Character) { return 2; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Immobilize') && !target.hasEffect('RecentlyImmobilized') && target.getTotalStat('str') <= 25;
  }

  use(user: Character, target: Character) {

    const immob = new Immobilize({});
    immob.cast(user, target);
  }

}
