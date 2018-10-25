


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ParryStance as CastEffect } from '../../../../../effects/stances/ParryStance';

import { get } from 'lodash';
import { NPC } from '../../../../../../shared/models/npc';

export class ParryStance extends Skill {

  static macroMetadata = {
    name: 'ParryStance',
    macro: 'stance parry',
    icon: 'surrounded-shield',
    color: '#fff',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Become more defensive, but lose offensive power. You also taunt foes. Requires weapon skill 10.',
    requireSkillLevel: 10
  };

  public targetsFriendly = true;

  public name = ['parrystance', 'stance parrystance', 'stance parry'];
  public unableToLearnFromStealing = true;

  canUse(user: Character) {
    if(user.isPlayer()) return true;
    const check = <NPC>user;
    return !check.$$stanceCooldown || check.$$stanceCooldown <= 0;
  }

  execute(user: Character) {

    const itemType = get(user.rightHand, 'type', 'Martial');
    if(!CastEffect.isValid(user, itemType, CastEffect.skillRequired)) return user.sendClientMessage('You cannot parry with that weapon.');

    this.use(user);
  }

  use(user: Character) {
    const stance = new CastEffect({});
    stance.cast(user, user, this);

    if(!user.isPlayer()) (<NPC>user).$$stanceCooldown = 15;
  }

}
