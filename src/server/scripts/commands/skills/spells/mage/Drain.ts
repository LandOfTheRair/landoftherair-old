
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Drain as CastEffect } from '../../../../../effects/damagers/Drain';

export class Drain extends Skill {

  static macroMetadata = {
    name: 'Drain',
    macro: 'cast drain',
    icon: 'wind-hole',
    color: '#af0000',
    mode: 'lockActivation',
    tooltipDesc: 'Drain health from a single target. Cost: 10 MP',
    requireSkillLevel: 15
  };

  public name = ['drain', 'cast drain'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && user.hp.ltePercent(75) && target.getTotalStat('hp') > 150;
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
