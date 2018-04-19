


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { VolcanoStance as CastEffect } from '../../../../../effects/stances/VolcanoStance';

export class VolcanoStance extends Skill {

  static macroMetadata = {
    name: 'VolcanoStance',
    macro: 'stance volcano',
    icon: 'fire-silhouette',
    color: '#DC143C',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Become more offensive, increasing your offensive capabilities and doing fire damage on hit.'
  };

  public targetsFriendly = true;

  public name = ['volcanostance', 'stance volcanostance', 'stance volcano'];

  execute(user: Character) {

    const item = user.rightHand;
    if(!item) return user.sendClientMessage('You need a weapon to stance with!');
    if(!CastEffect.isValid(user, item.type, CastEffect.skillRequired)) return user.sendClientMessage('You cannot stance with that weapon.');

    this.use(user);
  }

  use(user: Character) {
    const stance = new CastEffect({});
    stance.cast(user, user, this);
  }

}
