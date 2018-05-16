
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Vortex as CastEffect } from '../../../../../effects/misc/Vortex';

export class Vortex extends Skill {

  static macroMetadata = {
    name: 'Vortex',
    macro: 'cast vortex',
    icon: 'wind-hole',
    color: '#333',
    mode: 'autoActivate',
    tooltipDesc: 'Create a vortex which sucks in nearby items. Cost: 100 MP'
  };

  public name = ['vortex', 'cast vortex'];
  public format = 'Target';

  mpCost() { return 100; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return false;
  }

  execute(user: Character, { effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, user, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
