
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
    mode: 'lockActivation'
  };

  public name = 'cast magicmissile';
  public format = 'Target';

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 5;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {
    if(!args) return false;

    const target = this.getTarget(user, args);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
