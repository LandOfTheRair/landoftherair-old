
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class RightToKubby extends Command {

  public name = '~RtK';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const item = player.rightHand;
    if(!item) return;

    if(!item.isKubbiable) return room.sendClientLogMessage(client, 'That item is not kubbiable.');

    if(player.fullKubby()) return room.sendClientLogMessage(client, 'Your kubby is full.');

    player.addItemToKubby(item);
    player.setRightHand(null);
  }

}

