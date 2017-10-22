
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Stunned as CastEffect } from '../../../../../effects/Stunned';

export class Stun extends Skill {

  static macroMetadata = {
    name: 'Stun',
    macro: 'cast stun',
    icon: 'knockout',
    color: '#990',
    mode: 'clickToTarget'
  };

  public name = ['stun', 'cast stun'];
  public format = 'Target';

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 40;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

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
