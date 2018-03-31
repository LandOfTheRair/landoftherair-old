

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { FireMist } from '../../../../../effects/damagers/FireMist';

export class DedlaenDragonTurtleFire extends Skill {

  name = 'dedlaendragonturtlefire';

  execute() {}
  range(attacker: Character) { return 0; }
  mpCost() { return 1000; }

  use(user: Character, target: Character) {
    const fireMist = new FireMist({ range: 3 });
    fireMist.cast(user, target, this);
  }

}
