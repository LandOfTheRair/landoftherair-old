
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { BarNecro as CastEffect } from '../../../../../effects/BarNecro';

export class BarNecro extends Skill {

  public name = 'barnecro';
  public format = 'Target';

  static macroMetadata = {
    name: 'BarNecro',
    macro: 'barnecro',
    icon: 'rosa-shield',
    color: '#1b390e',
    mode: 'clickToTarget'
  };

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 40;
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
