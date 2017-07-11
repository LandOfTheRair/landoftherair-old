
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class Mug extends Skill {

  public name = 'mug';
  public format = 'Target';

  requiresLearn = false;

  static macroMetadata = {
    name: 'Mug',
    macro: 'mug',
    icon: 'hooded-assassin',
    color: '#530000',
    mode: 'lockActivation'
  };

  execute(user: Character, { gameState }) {
    this.use(user);
  }

  use(user: Character) {
  }

}
