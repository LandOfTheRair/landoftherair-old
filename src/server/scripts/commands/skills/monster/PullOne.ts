
import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Pull as CastEffect } from '../../../../effects/misc/Pull';

export class PullOne extends Skill {

  name = 'pullone';
  execute() {}

  range() { return 5; }

  canUse(user: Character, target: Character) {
    return user.distFrom(target) >= 0;
  }

  use(user: Character, target: Character) {
    const effect = new CastEffect({});
    effect.cast(user, target);
  }

}
