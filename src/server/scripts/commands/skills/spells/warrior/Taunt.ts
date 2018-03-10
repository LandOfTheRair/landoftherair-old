


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Taunt as CastEffect } from '../../../../../effects/arts/Taunt';

export class Taunt extends Skill {

  static macroMetadata = {
    name: 'Taunt',
    macro: 'art taunt',
    icon: 'enrage',
    color: '#a00',
    mode: 'clickToTarget',
    tooltipDesc: 'Taunt a single creature. Requires weapon skill 9 (Warrior).',
    requiresBaseClass: 'Warrior'
  };

  public name = 'art taunt';

  requiresLearn = false;

  execute(user: Character, { args }) {

    const item = user.rightHand;
    if(!item) return user.sendClientMessage('You need a weapon to taunt!');
    if(!CastEffect.isValid(user, item.type, CastEffect.skillRequired)) return user.sendClientMessage('You cannot taunt with that weapon.');

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(target === user) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const art = new CastEffect({});
    art.cast(user, target, this);
  }

}
