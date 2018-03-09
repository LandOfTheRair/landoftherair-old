
import { isString } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Hidden as CastEffect } from '../../../../effects/misc/Hidden';
import { CharacterHelper } from '../../../../helpers/character/character-helper';

export class Hide extends Skill {

  static macroMetadata = {
    name: 'Hide',
    macro: 'hide',
    icon: 'hidden',
    color: '#cccccc',
    bgColor: '#000000',
    mode: 'autoActivate',
    tooltipDesc: 'Hide in the shadows.'
  };

  public name = 'hide';
  public format = '';

  requiresLearn = false;

  execute(user: Character) {
    this.use(user);
  }

  use(user: Character) {
    const hideReason = CharacterHelper.canHide(user);
    if(isString(hideReason)) return user.sendClientMessage(hideReason);

    const effect = new CastEffect({});
    effect.cast(user, user, this);
  }

}
