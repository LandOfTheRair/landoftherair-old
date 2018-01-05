
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { FireMist as CastEffect } from '../../../../../effects/FireMist';

export class FireMist extends Skill {

  static macroMetadata = {
    name: 'FireMist',
    macro: 'cast firemist',
    icon: 'kaleidoscope-pearls',
    color: '#DC143C',
    mode: 'clickToTarget',
    tooltipDesc: 'Cast an area fire effect on a target (3x3). Cost: 40 MP'
  };

  public name = ['firemist', 'cast firemist'];
  public format = 'Target';

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
