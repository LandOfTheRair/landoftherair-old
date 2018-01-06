
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Absorption as CastEffect } from '../../../../../effects/Absorption';

export class Absorption extends Skill {

  static macroMetadata = {
    name: 'Absorption',
    macro: 'cast absorption',
    icon: 'magic-swirl',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Absorb all types of magic. Cost: 100 MP'
  };

  public name = ['absorption', 'cast absorption'];
  public format = 'Target';

  mpCost = () => 100;
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
