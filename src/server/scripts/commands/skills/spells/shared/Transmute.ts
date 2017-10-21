
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Transmute as CastEffect } from '../../../../../effects/Transmute';

export class Transmute extends Skill {

  static macroMetadata = {
    name: 'Transmute',
    macro: 'cast transmute',
    icon: 'coins',
    color: '#665600',
    mode: 'autoActivate'
  };

  public name = ['transmute', 'cast transmute'];

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 15;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, effect);
  }

  use(user: Character, baseEffect = { potency: 0 }) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, user, this);
  }

}
