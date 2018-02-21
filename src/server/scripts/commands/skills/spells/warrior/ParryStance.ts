
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ParryStance as CastEffect } from '../../../../../effects/stances/ParryStance';

export class ParryStance extends Skill {

  static macroMetadata = {
    name: 'Parry Stance',
    macro: 'stance parry',
    icon: 'surrounded-shield',
    color: '#000000',
    mode: 'autoActivate',
    tooltipDesc: 'Become more defensive, but lose offensive power. Requires weapon skill 13 (Warrior).',
    requiresBaseClass: 'Warrior'
  };

  public name = 'stance parry';

  requiresLearn = false;

  execute(user: Character, { gameState, args }) {

    const item = user.rightHand;
    if(!item) return user.sendClientMessage('You need a weapon to parry!');
    if(!CastEffect.isValid(user, item.type, CastEffect.skillRequired)) return user.sendClientMessage('You cannot parry with that weapon.');

    this.use(user);
  }

  use(user: Character) {
    const stance = new CastEffect({});
    stance.cast(user, user, this);
  }

}
