
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToGround extends Command {

  public name = '~LtG';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    if(!player.leftHand) return;
    gameState.addItemToGround(player, player.leftHand);
    player.setLeftHand(null);
    room.showGroundWindow(client);
  }

}
