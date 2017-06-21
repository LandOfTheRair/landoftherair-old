
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class LeftToBelt extends Command {

  public name = '~LtB';
  public format = '';

  execute(player: Player, { room, client, gameState, args }) {
    const item = player.leftHand;
    if(!item) return false;

    if(!item.isBeltable) return room.sendClientLogMessage(client, 'That item is not beltable.');

    if(player.fullBelt()) return room.sendClientLogMessage(client, 'Your belt is full.');

    player.addItemToBelt(item);
    player.setLeftHand(null);
  }

}
