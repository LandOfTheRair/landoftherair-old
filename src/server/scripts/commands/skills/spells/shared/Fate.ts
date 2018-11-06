


import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Fate as CastEffect } from '../../../../../effects';

export class Fate extends Skill {

  static macroMetadata = {
    name: 'Fate',
    macro: 'cast fate',
    icon: 'solar-time',
    color: '#000',
    mode: 'autoActivate',
    tooltipDesc: '???'
  };

  public targetsFriendly = true;

  public name = ['fate', 'cast fate'];
  public format = '';

  // it would be funny to have an enemy that can cast fate, though.
  canUse(user: Character, target: Character) {
    return false;
  }

  mpCost() { return 0; }
  range(attacker: Character) { return 0; }

  execute(user: Character, { args, effect }) {
    this.use(user, user, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target);
  }

}
