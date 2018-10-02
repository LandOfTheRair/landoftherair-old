
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Shield as CastEffect } from '../../../../../effects/arts/Shield';

export class Shield extends Skill {

  static macroMetadata = {
    name: 'Shield',
    macro: 'art shield',
    icon: 'vibrating-shield',
    color: '#a00',
    mode: 'clickToTarget',
    tooltipDesc: 'Increase your physical and magical resistance.'
  };

  public targetsFriendly = true;

  public name = ['shield', 'art shield'];

  canUse(user: Character) {
    return !user.hasEffect('Shield');
  }

  execute(user: Character, { effect }) {
    this.use(user, user, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const art = new CastEffect(baseEffect);
    art.cast(user, target, this);
  }

}
