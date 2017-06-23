
import { startsWith } from 'lodash';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../models/character';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class Attack extends Skill {

  public name = 'attack';

  static macroMetadata = {
    name: 'Attack',
    macro: 'attack',
    icon: 'blade-drag',
    color: '#530000',
    mode: 'lockActivation'
  };

  execute(user: Character, { gameState, args }) {
    if(!args) return false;

    const possTargets = user.$$room.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');
    if(target.distFrom(user) > 0) return user.sendClientMessage('That target is too far away!');

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    CombatHelper.physicalAttack(user, target);
  }

}
