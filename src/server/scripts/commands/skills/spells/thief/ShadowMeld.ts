


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

  public name = ['shadowmeld', 'cast shadowmeld'];

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
