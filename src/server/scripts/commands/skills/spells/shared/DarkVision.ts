
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { DarkVision as CastEffect } from '../../../../../effects/buffs/DarkVision';

export class DarkVision extends Skill {

  static macroMetadata = {
    name: 'DarkVision',
    macro: 'cast darkvision',
    icon: 'angry-eyes',
    color: '#000',
    mode: 'clickToTarget',
    tooltipDesc: 'See in the darkness. Cost: 25 MP'
  };

  public name = ['darkvision', 'cast darkvision'];

  mpCost() { return 25; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.isValidBuffTarget(user, target)) return user.sendClientMessage('You cannot target that person with this spell.');

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const effect = new CastEffect({});
    effect.cast(user, target, this);
  }

}
