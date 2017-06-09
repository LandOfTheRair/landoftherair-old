
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToSack extends Command {

  public name = '~RtS';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const item = player.rightHand;
    if(!item) return;

    if(!item.isSackable) return room.sendClientLogMessage(client, 'That item is not sackable.');

    if(player.fullSack()) return room.sendClientLogMessage(client, 'Your sack is full.');

    player.addItemToSack(item);
    player.rightHand = null;
  }

}
