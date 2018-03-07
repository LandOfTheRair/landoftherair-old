
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Autoheal as CastEffect } from '../../../../../effects/buffs/Autoheal';

export class Autoheal extends Skill {

  static macroMetadata = {
    name: 'Autoheal',
    macro: 'cast autoheal',
    icon: 'self-love',
    color: '#00c',
    mode: 'clickToTarget',
    tooltipDesc: 'Automatically healing when health gets too low. Cost: 50 MP'
  };

  public name = ['autoheal', 'cast autoheal'];
  public format = 'Target';

  mpCost() { return 50; }
  range(attacker: Character) { return 5; }

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
