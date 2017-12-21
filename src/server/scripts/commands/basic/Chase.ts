
import { startsWith } from 'lodash';

import { Skill } from '../../../base/Skill';
import { Character } from '../../../../shared/models/character';
import { MoveHelper } from '../../../helpers/move-helper';
import { MessageHelper } from '../../../helpers/message-helper';

export class Chase extends Skill {

  static macroMetadata = {
    name: 'Chase',
    macro: 'chase',
    icon: 'hooded-figure',
    color: '#000000',
    mode: 'lockActivation',
    tooltipDesc: 'Move towards a target.'
  };

  public name = 'chase';

  requiresLearn = false;

  range = (attacker: Character) => 4;

  execute(user: Character, { args }) {
    if(!args) return false;

    const possTargets = MessageHelper.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.sendClientMessage('You do not see that person.');

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const xDiff = target.x - user.x;
    const yDiff = target.y - user.y;

    MoveHelper.move(user, { room: user.$$room, gameState: user.$$room.state, x: xDiff, y: yDiff }, true);

    user.$$room.updatePos(user);
  }

}
