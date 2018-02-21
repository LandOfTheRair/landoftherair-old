
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Identify as CastEffect } from '../../../../../effects/misc/Identify';

export class Identify extends Skill {

  static macroMetadata = {
    name: 'Identify',
    macro: 'cast identify',
    icon: 'uncertainty',
    color: '#665600',
    mode: 'autoActivate',
    tooltipDesc: 'Identify the attributes of the item in your right hand. Cost: 15 MP'
  };

  public name = ['identify', 'cast identify'];

  mpCost = () => 15;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!user.rightHand) return user.sendClientMessage('You need to have something in your right hand to identify it.');

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, effect);
  }

  use(user: Character, baseEffect = { potency: 0 }) {
    let potency = 1;
    if(user.baseClass === 'Mage') potency += 1;

    const effect = new CastEffect({ potency });
    effect.cast(user, user);
  }

}
