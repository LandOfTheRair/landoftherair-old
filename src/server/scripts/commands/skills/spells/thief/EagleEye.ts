


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

  public targetsFriendly = true;

  public name = ['eagleeye', 'cast eagleeye'];

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('EagleEye');
  }

  mpCost() { return 50; }

  execute(user: Character, { args, effect }) {

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
