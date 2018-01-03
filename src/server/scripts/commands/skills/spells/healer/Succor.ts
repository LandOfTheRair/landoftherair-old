
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Succor as CastEffect } from '../../../../../effects/Succor';

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

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 25;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, effect);
  }

  async use(user: Character, baseEffect = {}) {
    const effect = new CastEffect({});
    effect.cast(user, user);
  }

}
