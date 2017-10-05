
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../models/character';
import { Hidden as CastEffect } from '../../../../effects/Hidden';

export class Hide extends Skill {

  static macroMetadata = {
    name: 'Hide',
    macro: 'hide',
    icon: 'hidden',
    color: '#cccccc',
    backgroundColor: '#000000',
    mode: 'autoActivate'
  };

  public name = 'hide';
  public format = '';

  requiresLearn = false;

  execute(user: Character, { gameState }) {
    this.use(user);
  }

  use(user: Character) {
    if(!user.canHide()) return user.sendClientMessage('You were unable to hide.');

    const effect = new CastEffect({});
    effect.cast(user, user, this);
  }

}
