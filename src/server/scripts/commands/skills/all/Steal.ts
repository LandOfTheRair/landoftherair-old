
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class Steal extends Skill {

  static macroMetadata = {
    name: 'Steal',
    macro: 'steal',
    icon: 'take-my-money',
    color: '#7F6B00',
    mode: 'lockActivation'
  };

  public name = 'steal';
  public format = 'Target';

  requiresLearn = false;

  execute(user: Character, { gameState }) {
    this.use(user);
  }

  use(user: Character) {
  }

}
