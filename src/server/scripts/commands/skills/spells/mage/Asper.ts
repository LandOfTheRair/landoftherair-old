
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Asper as CastEffect } from '../../../../../effects/damagers/Asper';

export class Asper extends Skill {

  static macroMetadata = {
    name: 'Asper',
    macro: 'cast asper',
    icon: 'wind-hole',
    color: '#0059bd',
    mode: 'lockActivation',
    tooltipDesc: 'Drain mana from a single target. Cost: 10 MP'
  };

  public name = ['asper', 'cast asper'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && user.mp.ltePercent(75) && target.mp.total > 50;
  }

  mpCost() { return 10; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { args, effect }) {
    if(!args) return false;

    const target = this.getTarget(user, args);
    if(!target) return;

    if(target === user) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
