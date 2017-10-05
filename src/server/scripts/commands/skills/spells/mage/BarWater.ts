
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { BarWater as CastEffect } from '../../../../../effects/BarWater';

export class BarWater extends Skill {

  public name = 'barwater';
  public format = 'Target';

  static macroMetadata = {
    name: 'BarWater',
    macro: 'barwater',
    icon: 'rosa-shield',
    color: '#208aec',
    mode: 'clickToTarget'
  };

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
