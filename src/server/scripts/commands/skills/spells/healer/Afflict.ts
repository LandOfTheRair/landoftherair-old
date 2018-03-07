
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Afflict as CastEffect } from '../../../../../effects/damagers/Afflict';

export class Afflict extends Skill {

  static macroMetadata = {
    name: 'Afflict',
    macro: 'cast afflict',
    icon: 'bolas',
    color: '#bd5900',
    mode: 'lockActivation',
    tooltipDesc: 'Inflict necrotic damage on a single target. Cost: 10 MP'
  };

  public name = ['afflict', 'cast afflict'];
  public format = 'Target';

  mpCost() { return 10; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { gameState, args, effect }) {
    if(!args) return false;

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
