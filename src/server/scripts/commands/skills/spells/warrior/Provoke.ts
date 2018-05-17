
import { maxBy, get } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Provoke as CastEffect } from '../../../../../effects/arts/Provoke';

export class Provoke extends Skill {

  static macroMetadata = {
    name: 'Provoke',
    macro: 'art provoke',
    icon: 'enrage',
    color: '#a00',
    mode: 'clickToTarget',
    tooltipDesc: 'Provoke a single creature.'
  };

  public name = ['provoke', 'art provoke'];

  range() {
    return 5;
  }

  canUse(user: Character, target: Character) {
    const agro = target.agro;
    const highestAgro = maxBy(Object.keys(agro), person => agro[person]);

    return super.canUse(user, target) && highestAgro !== user.uuid;
  }

  execute(user: Character, { args, effect }) {
    const itemType = get(user.rightHand, 'type', 'Martial');

    if(!CastEffect.isValid(user, itemType, CastEffect.skillRequired)) return user.sendClientMessage('You cannot provoke with that weapon.');

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(target === user) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const art = new CastEffect(baseEffect);
    art.cast(user, target, this);
  }

}
