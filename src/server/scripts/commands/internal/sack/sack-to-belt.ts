
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToBelt extends Command {

  public name = '~StB';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack[slot];
    if(!item) return false;

    if(!item.isBeltable) return player.sendClientMessage('That item is not beltable.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(player.fullBelt()) return player.sendClientMessage('Your belt is full.');

    player.addItemToBelt(item);
    player.takeItemFromSack(slot);
  }

}
