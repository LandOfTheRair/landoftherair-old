
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { MagicBolt as CastEffect } from '../../../../../effects/damagers/MagicBolt';

export class MagicBolt extends Skill {

  static macroMetadata = {
    name: 'MagicBolt',
    macro: 'cast magicbolt',
    icon: 'burning-dot',
    color: '#0059bd',
    mode: 'lockActivation',
    tooltipDesc: 'Inflict energy damage on a single target. Cost: 10 MP'
  };

  public name = ['magicbolt', 'cast magicbolt'];
  public format = 'Target';

  mpCost() { return 10; }
  range(attacker: Character) { return 5; }

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
