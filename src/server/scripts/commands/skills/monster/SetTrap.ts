
import { startsWith } from 'lodash';

import * as dice from 'dice.js';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../models/character';
import { Poison as CastEffect } from '../../../../effects/Poison';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class SetTrap extends Skill {

  name = '';
  execute() {}
  range = () => 0;

  canUse(user: Character, target: Character) {
    return true;
  }

  use(user: Character, target: Character) {

  }

}
