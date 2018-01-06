
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { MagicMissile as CastEffect } from '../../../../../effects/MagicMissile';

export class MagicMissile extends Skill {

  static macroMetadata = {
    name: 'MagicMissile',
    macro: 'cast magicmissile',
    icon: 'missile-swarm',
    color: '#0059bd',
    mode: 'lockActivation',
    tooltipDesc: 'Inflict energy damage on a single target. Cost: 5 MP'
  };

  public name = ['magicmissile', 'cast magicmissile'];
  public format = 'Target';

  mpCost = () => 5;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {
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
