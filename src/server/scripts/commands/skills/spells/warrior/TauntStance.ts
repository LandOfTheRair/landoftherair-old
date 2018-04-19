


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { TauntStance as CastEffect } from '../../../../../effects/stances/TauntStance';

export class TauntStance extends Skill {

  static macroMetadata = {
    name: 'TauntStance',
    macro: 'stance taunt',
    icon: 'enrage',
    color: '#fff',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Become more boisterous, taunting foes but losing offense and defense. Requires weapon skill 10.',
    requireSkillLevel: 10
  };

  public targetsFriendly = true;

  public name = ['tauntstance', 'stance tauntstance', 'stance taunt'];

  execute(user: Character) {

    const item = user.rightHand;
    if(!item) return user.sendClientMessage('You need a weapon to taunt!');
    if(!CastEffect.isValid(user, item.type, CastEffect.skillRequired)) return user.sendClientMessage('You cannot taunt with that weapon.');

    this.use(user);
  }

  use(user: Character) {
    const stance = new CastEffect({});
    stance.cast(user, user, this);
  }

}
