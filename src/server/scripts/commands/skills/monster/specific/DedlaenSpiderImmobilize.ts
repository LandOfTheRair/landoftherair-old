

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Immobilize } from '../../../../../effects/antibuffs/Immobilize';

export class DedlaenSpiderImmobilize extends Skill {

  name = 'dedlaenspiderimmobilize';
  execute() {}

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Immobilize') && !target.hasEffect('RecentlyImmobilized');
  }

  use(user: Character, target: Character) {

    const immob = new Immobilize({});
    immob.cast(user, target);
  }

}
