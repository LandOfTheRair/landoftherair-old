
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { DarkVision as CastEffect } from '../../../../../effects/DarkVision';

export class DarkVision extends Skill {

  static macroMetadata = {
    name: 'DarkVision',
    macro: 'cast darkvision',
    icon: 'angry-eyes',
    color: '#000',
    mode: 'clickToTarget',
    tooltipDesc: 'See in the darkness.'
  };

  public name = ['darkvision', 'cast darkvision'];

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
