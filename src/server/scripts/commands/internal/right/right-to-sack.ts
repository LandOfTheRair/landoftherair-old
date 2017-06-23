
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToSack extends Command {

  public name = '~RtS';
  public format = '';

  execute(player: Player, { room, gameState, args }) {
    const item = player.rightHand;
    if(!item) return false;

    if(!item.isSackable) return player.sendClientMessage('That item is not sackable.');

    if(player.fullSack()) return player.sendClientMessage('Your sack is full.');

    player.addItemToSack(item);
    player.setRightHand(null);
  }

}
