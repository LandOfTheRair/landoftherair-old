
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Combust as CastEffect } from '../../../../../effects/damagers/Combust';

export class Combust extends Skill {

  static macroMetadata = {
    name: 'Combust',
    macro: 'cast combust',
    icon: 'burning-dot',
    color: '#DC143C',
    mode: 'lockActivation',
    tooltipDesc: 'Inflict fire damage on a single target. Cost: 20 MP',
    skillTPCost: 5
  };

  public name = ['combust', 'cast combust'];
  public format = 'Target';

  mpCost() { return 20; }
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
