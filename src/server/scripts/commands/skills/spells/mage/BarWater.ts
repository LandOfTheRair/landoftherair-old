
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { BarWater as CastEffect } from '../../../../../effects/BarWater';

export class BarWater extends Skill {

  static macroMetadata = {
    name: 'BarWater',
    macro: 'cast barwater',
    icon: 'rosa-shield',
    color: '#208aec',
    mode: 'clickToTarget',
    tooltipDesc: 'Shield water damage for a single target.'
  };

  public name = ['barwater', 'cast barwater'];
  public format = 'Target';

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 20;
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
