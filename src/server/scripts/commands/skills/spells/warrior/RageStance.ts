


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { RageStance as CastEffect } from '../../../../../effects/stances/RageStance';

import { get } from 'lodash';

export class RageStance extends Skill {

  static macroMetadata = {
    name: 'RageStance',
    macro: 'stance rage',
    icon: 'swords-power',
    color: '#fff',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Become more offensive, but lose defensive power. Requires weapon skill 10.',
    requireSkillLevel: 10
  };

  public targetsFriendly = true;

  public name = ['ragestance', 'stance ragestance', 'stance rage'];

  execute(user: Character) {

    const itemType = get(user.rightHand, 'type', 'Martial');
    if(!CastEffect.isValid(user, itemType, CastEffect.skillRequired)) return user.sendClientMessage('You cannot enrage with that weapon.');

    this.use(user);
  }

  use(user: Character) {
    const stance = new CastEffect({});
    stance.cast(user, user, this);
  }

}
