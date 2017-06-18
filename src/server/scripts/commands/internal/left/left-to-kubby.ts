
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToKubby extends Command {

  public name = '~LtK';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const item = player.leftHand;

    if(!item.isKubbiable) return room.sendClientLogMessage(client, 'That item is not kubbiable.');

    if(player.fullKubby()) return room.sendClientLogMessage(client, 'Your kubby is full.');

    player.addItemToKubby(item);
    player.setLeftHand(null);
  }

}

