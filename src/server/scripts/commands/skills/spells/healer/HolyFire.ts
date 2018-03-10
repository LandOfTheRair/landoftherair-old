
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { HolyFire as CastEffect } from '../../../../../effects/damagers/HolyFire';

export class HolyFire extends Skill {

  static macroMetadata = {
    name: 'HolyFire',
    macro: 'cast holyfire',
    icon: 'fireflake',
    color: '#f50',
    mode: 'lockActivation',
    tooltipDesc: 'Inflict fire damage on a single target. Cost: 15 MP'
  };

  public name = ['holyfire', 'cast holyfire'];
  public format = 'Target';

  mpCost() { return 15; }
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
