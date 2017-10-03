
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { Poison as CastEffect } from '../../../../../effects/Poison';

export class Poison extends Skill {

  public name = 'poison';
  public format = 'Target';

  static macroMetadata = {
    name: 'Poison',
    macro: 'poison',
    icon: 'poison-gas',
    color: '#0a0',
    mode: 'clickToTarget'
  };

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 15;
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
