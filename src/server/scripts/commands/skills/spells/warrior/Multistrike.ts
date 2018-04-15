
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Multistrike as CastEffect } from '../../../../../effects/arts/Multistrike';

export class Multistrike extends Skill {

  static macroMetadata = {
    name: 'Multistrike',
    macro: 'art multistrike',
    icon: 'sword-spin',
    color: '#a00',
    mode: 'autoActivate',
    tooltipDesc: 'Attack multiple creatures on your tile. Requires weapon skill 13.',
    requireSkillLevel: 13
  };

  public name = ['multistrike', 'art multistrike'];

  execute(user: Character, { effect }) {

    const item = user.rightHand;
    if(!item) return user.sendClientMessage('You need a weapon to do that!');
    if(!CastEffect.isValid(user, item.type, CastEffect.skillRequired)) return user.sendClientMessage('You cannot multistrike with that weapon.');

    this.use(user, user, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const art = new CastEffect(baseEffect);
    art.cast(user, target, this);
  }

}
