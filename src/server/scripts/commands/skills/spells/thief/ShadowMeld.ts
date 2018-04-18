


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ShadowMeld as CastEffect } from '../../../../../effects/buffs/ShadowMeld';

export class ShadowMeld extends Skill {

  static macroMetadata = {
    name: 'ShadowMeld',
    macro: 'cast shadowmeld',
    icon: 'hidden',
    color: '#00c',
    mode: 'autoActivate',
    tooltipDesc: 'Force a shadow to follow you and meld with it. Cost: 50 HP'
  };

  public targetsFriendly = true;

  public name = ['shadowmeld', 'cast shadowmeld'];

  canUse(user: Character, target: Character) {
    return super.canUse(user, target)
      && !target.hasEffect('Revealed')
      && !target.hasEffect('ShadowMeld')
      && !target.hasEffect('Hidden');
  }

  mpCost() { return 50; }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    if(user.hasEffect('Revealed')) return user.sendClientMessage('You cannot hide right now!');
    if(user.hasEffect('Hidden')) return user.sendClientMessage('You cannot meld with shadows you are hidden in!');

    this.use(user, user, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
