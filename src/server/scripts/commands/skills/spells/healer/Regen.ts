
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Regen as CastEffect } from '../../../../../effects/cures/Regen';

export class Regen extends Skill {

  static macroMetadata = {
    name: 'Regen',
    macro: 'cast regen',
    icon: 'star-swirl',
    color: '#00c',
    mode: 'clickToTarget',
    tooltipDesc: 'Cast a restorative aura on the target. Cost: 30 MP'
  };

  public name = ['regen', 'cast regen'];
  public format = 'Target';

  mpCost = () => 30;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.isValidBuffTarget(user, target)) return user.sendClientMessage('You cannot target that person with this spell.');

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
