
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToLeft extends Command {

  public name = '~RtL';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const left = player.leftHand;
    const right = player.rightHand;

    player.setLeftHand(right);
    player.setRightHand(left);
  }

}
