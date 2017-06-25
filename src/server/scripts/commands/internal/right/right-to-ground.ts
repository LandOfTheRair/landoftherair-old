
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToGround extends Command {

  public name = '~RtG';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    if(!player.rightHand) return false;
    player.$$room.addItemToGround(player, player.rightHand);
    player.setRightHand(null);
    player.$$room.showGroundWindow(player);
  }

}
