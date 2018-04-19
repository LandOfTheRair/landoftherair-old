


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { RageStance as CastEffect } from '../../../../../effects/stances/RageStance';

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

    const item = user.rightHand;
    if(!item) return user.sendClientMessage('You need a weapon to enrage!');
    if(!CastEffect.isValid(user, item.type, CastEffect.skillRequired)) return user.sendClientMessage('You cannot enrage with that weapon.');

    this.use(user);
  }

  use(user: Character) {
    const stance = new CastEffect({});
    stance.cast(user, user, this);
  }

}
