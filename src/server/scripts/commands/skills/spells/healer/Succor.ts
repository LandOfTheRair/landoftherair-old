
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Succor as CastEffect } from '../../../../../effects/misc/Succor';

export class Succor extends Skill {

  static macroMetadata = {
    name: 'Succor',
    macro: 'cast succor',
    icon: 'blackball',
    color: '#080',
    mode: 'autoActivate',
    tooltipDesc: 'Create a consumable that will let you return to your current location. Cost: 25 MP'
  };

  public name = ['succor', 'cast succor'];
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
