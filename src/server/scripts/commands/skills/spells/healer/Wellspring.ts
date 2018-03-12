
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Wellspring as CastEffect } from '../../../../../effects/misc/Wellspring';

export class Wellspring extends Skill {

  static macroMetadata = {
    name: 'Wellspring',
    macro: 'cast wellspring',
    icon: 'holy-water',
    color: '#080',
    mode: 'autoActivate',
    tooltipDesc: 'Create a bottle of holy water. Cost: 25 MP'
  };

  public name = ['wellspring', 'cast wellspring'];
  public format = '';

  mpCost() { return 25; }

  execute(user: Character, { effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, effect);
  }

  async use(user: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, user, this);
  }

}
