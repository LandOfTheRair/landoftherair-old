
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Disease as CastEffect } from '../../../../../effects/Disease';

export class Disease extends Skill {

  static macroMetadata = {
    name: 'Disease',
    macro: 'cast disease',
    icon: 'death-juice',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Inflict a deadly disease on your target. Cost: 30 MP'
  };

  public name = ['disease', 'cast disease'];
  public format = 'Target';

  mpCost = () => 30;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args);
    if(!target) return;

    if(target === user) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
