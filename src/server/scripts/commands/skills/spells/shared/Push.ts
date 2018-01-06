
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Push as CastEffect } from '../../../../../effects/Push';

export class Push extends Skill {

  static macroMetadata = {
    name: 'Push',
    macro: 'cast push',
    icon: 'air-zigzag',
    color: '#000',
    mode: 'clickToTarget',
    tooltipDesc: 'Push an enemy around. Cost: 25 MP'
  };

  public name = ['push', 'cast push'];

  mpCost = () => 25;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(target === user) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const effect = new CastEffect({});
    effect.cast(user, target);
  }

}
