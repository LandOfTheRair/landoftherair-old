
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../../effects/dots/Poison';

export class Poison extends Skill {

  static macroMetadata = {
    name: 'Poison',
    macro: 'cast poison',
    icon: 'poison-gas',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Inflict a deadly poison on your target. Cost: 15 MP'
  };

  public name = ['poison', 'cast poison'];
  public format = 'Target';

  mpCost = () => 15;
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
