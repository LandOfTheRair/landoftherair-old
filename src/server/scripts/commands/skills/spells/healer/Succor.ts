
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Revive as CastEffect } from '../../../../../effects/Revive';

export class Succor extends Skill {

  static macroMetadata = {
    name: 'Succor',
    macro: 'cast succor',
    icon: 'blackball',
    color: '#080',
    mode: 'autoActivate'
  };

  public name = ['succor', 'cast succor'];
  public format = '';

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 25;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    if(user.rightHand) return user.sendClientMessage('You must empty your right hand!');

    this.use(user, effect);
  }

  use(user: Character, baseEffect = {}) {
    user.sendClientMessage('You channel your memories of this place into a ball of magical energy.');

  }

}
