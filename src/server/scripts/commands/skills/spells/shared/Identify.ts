
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Identify as CastEffect } from '../../../../../effects/misc/Identify';

export class Identify extends Skill {

  static macroMetadata = {
    name: 'Identify',
    macro: 'cast identify',
    icon: 'uncertainty',
    color: '#665600',
    mode: 'autoActivate',
    tooltipDesc: 'Identify the attributes of the item in your right hand. Cost: 15 MP'
  };

  public name = ['identify', 'cast identify'];

  mpCost() { return 15; }

  canUse() {
    return false;
  }

  execute(user: Character, { effect }) {
    if(!user.rightHand) return user.sendClientMessage('You need to have something in your right hand to identify it.');

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, user, effect);
  }

  use(user: Character, target: Character, baseEffect = { potency: 0 }) {
    let potency = 1;
    /** PERK:CLASS:MAGE:Mages always cast identify at a tier higher. */
    if(user.baseClass === 'Mage') potency += 1;

    const effect = new CastEffect({ potency });
    effect.cast(user, target, this);
  }

}
