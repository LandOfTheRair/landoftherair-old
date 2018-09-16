
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { ConjureHealing as CastEffect } from '../../../../../effects/misc/ConjureHealing';

export class ConjureHealing extends Skill {

  static macroMetadata = {
    name: 'ConjureHealing',
    macro: 'cast conjurehealing',
    icon: 'brandy-bottle',
    color: '#080',
    mode: 'autoActivate',
    tooltipDesc: 'Create a bottle of bound healing water. Cost: 25 MP'
  };

  public name = ['conjurehealing', 'cast conjurehealing'];
  public format = '';

  canUse(user: Character, target: Character) {
    return false;
  }

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
