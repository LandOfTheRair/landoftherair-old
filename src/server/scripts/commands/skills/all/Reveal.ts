
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';

export class Reveal extends Skill {

  public name = 'reveal';
  public format = '';

  requiresLearn = false;

  execute(user: Character, { gameState }) {
    this.use(user);
  }

  use(user: Character) {
    const hidden = user.hasEffect('Hidden');
    if(!hidden) return user.sendClientMessage('You are not hidden!');
    user.unapplyEffect(hidden, true);
  }

}
