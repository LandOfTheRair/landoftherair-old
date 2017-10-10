
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { Antidote as CastEffect } from '../../../../../effects/Antidote';

export class Antidote extends Skill {

  static macroMetadata = {
    name: 'Antidote',
    macro: 'cast antidote',
    icon: 'miracle-medecine',
    color: '#0a0',
    mode: 'clickToTarget'
  };

  public name = 'cast antidote';
  public format = 'Target';

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 10;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
