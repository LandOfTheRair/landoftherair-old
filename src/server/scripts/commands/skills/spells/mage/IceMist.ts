
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { IceMist as CastEffect } from '../../../../../effects/IceMist';

export class IceMist extends Skill {

  static macroMetadata = {
    name: 'IceMist',
    macro: 'cast icemist',
    icon: 'kaleidoscope-pearls',
    color: '#000080',
    mode: 'clickToTarget'
  };

  public name = 'cast icemist';
  public format = 'Target';

  flagSkills = [SkillClassNames.Conjuration];

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
