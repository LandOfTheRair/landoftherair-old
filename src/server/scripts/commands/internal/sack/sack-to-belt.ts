
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToBelt extends Command {

  public name = '~StB';
  public format = 'ItemSlot';

  execute(player: Player, { room, client, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack[slot];
    if(!item) return false;

    if(!item.isBeltable) return room.sendClientLogMessage(client, 'That item is not beltable.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    if(player.fullBelt()) return room.sendClientLogMessage(client, 'Your belt is full.');

    player.addItemToBelt(item);
    player.takeItemFromSack(slot);
  }

}
