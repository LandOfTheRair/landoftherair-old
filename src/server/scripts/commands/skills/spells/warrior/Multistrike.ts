
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
    tooltipDesc: 'Attack up to 4 creatures on your tile. Requires weapon skill 17 (Warrior).',
    requiresBaseClass: 'Warrior'
  };

  public name = ['multistrike', 'art multistrike'];

  requiresLearn = false;

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
