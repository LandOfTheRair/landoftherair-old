
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { TrueSight as CastEffect } from '../../../../../effects/TrueSight';

export class TrueSight extends Skill {

  static macroMetadata = {
    name: 'TrueSight',
    macro: 'cast truesight',
    icon: 'all-seeing-eye',
    color: '#00a',
    mode: 'clickToTarget',
    tooltipDesc: 'See hidden walls and other hidden features.'
  };

  public name = ['truesight', 'cast truesight'];

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 25;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const effect = new CastEffect({});
    effect.cast(user, target);
  }

}
