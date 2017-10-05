
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { IceMist as CastEffect } from '../../../../../effects/IceMist';

export class IceMist extends Skill {

  public name = 'icemist';
  public format = 'Target';

  static macroMetadata = {
    name: 'IceMist',
    macro: 'icemist',
    icon: 'kaleidoscope-pearls',
    color: '#000080',
    mode: 'clickToTarget'
  };

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
