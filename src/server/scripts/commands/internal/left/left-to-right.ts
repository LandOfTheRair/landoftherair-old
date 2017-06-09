
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToRight extends Command {

  public name = '~LtR';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const left = player.leftHand;
    const right = player.rightHand;

    player.leftHand = right;
    player.rightHand = left;
  }

}
