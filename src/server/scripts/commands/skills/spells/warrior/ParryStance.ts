


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ParryStance as CastEffect } from '../../../../../effects/stances/ParryStance';

export class ParryStance extends Skill {

  static macroMetadata = {
    name: 'Parry Stance',
    macro: 'stance parry',
    icon: 'surrounded-shield',
    color: '#fff',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Become more defensive, but lose offensive power.',
    requireSkillLevel: 10
  };

  public targetsFriendly = true;

  public name = ['parrystance', 'stance parrystance', 'stance parry'];

  execute(user: Character) {

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
