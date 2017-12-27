
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToGround extends Command {

  public name = '~LtG';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    if(!player.leftHand) return;
    if(this.isAccessingLocker(player)) return;
    room.addItemToGround(player, player.leftHand);
    player.setLeftHand(null);
    room.showGroundWindow(player);
  }

}
