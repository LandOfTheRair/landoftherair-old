
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class PotionToGround extends Command {

  public name = '~PtG';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    if(!player.potionHand) return false;
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    room.addItemToGround(player, player.potionHand);
    player.setPotionHand(null);
    room.showGroundWindow(player);
  }

}
