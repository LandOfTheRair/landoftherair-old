
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToBelt extends Command {

  public name = '~RtB';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const item = player.rightHand;
    if(!item) return;

    if(!item.isBeltable) return room.sendClientLogMessage(client, 'That item is not beltable.');

    if(player.fullBelt()) return room.sendClientLogMessage(client, 'Your belt is full.');

    player.addItemToBelt(item);
    player.rightHand = null;
  }

}
