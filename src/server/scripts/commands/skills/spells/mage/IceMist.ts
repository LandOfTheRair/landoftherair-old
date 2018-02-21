
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { IceMist as CastEffect } from '../../../../../effects/damagers/IceMist';

export class IceMist extends Skill {

  static macroMetadata = {
    name: 'IceMist',
    macro: 'cast icemist',
    icon: 'kaleidoscope-pearls',
    color: '#000080',
    mode: 'clickToTarget',
    tooltipDesc: 'Cast an area ice effect on a target (3x3). Cost: 35 MP'
  };

  public name = ['icemist', 'cast icemist'];
  public format = 'Target';

  mpCost = () => 35;
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
