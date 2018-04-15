
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { MagicMissile as CastEffect } from '../../../../../effects/damagers/MagicMissile';

export class MagicMissile extends Skill {

  static macroMetadata = {
    name: 'MagicMissile',
    macro: 'cast magicmissile',
    icon: 'missile-swarm',
    color: '#0059bd',
    mode: 'lockActivation',
    tooltipDesc: 'Inflict energy damage on a single target. Cost: 5 MP',
    skillTPCost: 1
  };

  public name = ['magicmissile', 'cast magicmissile'];
  public format = 'Target';

  mpCost() { return 5; }
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
