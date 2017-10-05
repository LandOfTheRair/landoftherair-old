
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class Backstab extends Skill {

  static macroMetadata = {
    name: 'Backstab',
    macro: 'backstab',
    icon: 'backstab',
    color: '#530000',
    mode: 'lockActivation'
  };

  public name = 'backstab';
  public format = 'Target';

  requiresLearn = false;

  execute(user: Character, { gameState }) {
    this.use(user);
  }

  use(user: Character) {
  }

}
