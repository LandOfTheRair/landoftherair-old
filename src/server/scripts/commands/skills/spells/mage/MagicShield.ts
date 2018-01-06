
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { MagicShield as CastEffect } from '../../../../../effects/MagicShield';

export class MagicShield extends Skill {

  static macroMetadata = {
    name: 'Magic Shield',
    macro: 'cast magicshield',
    icon: 'vibrating-shield',
    color: '#a0a',
    mode: 'clickToTarget',
    tooltipDesc: 'Negate some physical damage. Cost: 100 MP'
  };

  public name = ['magicshield', 'cast magicshield'];
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
