
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToGround extends Command {

  public name = '~RtG';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    if(!player.rightHand) return;
    gameState.addItemToGround(player, player.rightHand);
    player.setRightHand(null);
    room.showGroundWindow(client);
  }

}
