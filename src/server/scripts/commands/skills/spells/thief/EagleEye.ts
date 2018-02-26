
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { EagleEye as CastEffect } from '../../../../../effects/buffs/EagleEye';

export class EagleEye extends Skill {

  static macroMetadata = {
    name: 'EagleEye',
    macro: 'cast eagleeye',
    icon: 'dead-eye',
    color: '#f00',
    mode: 'autoActivate',
    tooltipDesc: 'See through the trees and to the depths of the waters. Cost: 50 HP'
  };

  public name = ['eagleeye', 'cast eagleeye'];

  mpCost = () => 50;
  range = () => 0;

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
