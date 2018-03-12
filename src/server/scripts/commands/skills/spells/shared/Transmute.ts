
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Transmute as CastEffect } from '../../../../../effects/misc/Transmute';

export class Transmute extends Skill {

  static macroMetadata = {
    name: 'Transmute',
    macro: 'cast transmute',
    icon: 'coins',
    color: '#665600',
    mode: 'autoActivate',
    tooltipDesc: 'Convert the items on your current tile into gold. Cost: 15 MP'
  };

  public name = ['transmute', 'cast transmute'];

  mpCost() { return 15; }

  execute(user: Character, { effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, effect);
  }

  use(user: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, user, this);
  }

}
