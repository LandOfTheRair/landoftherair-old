
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToSack extends Command {

  public name = '~BtS';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.belt[slot];
    if(!item) return false;

    if(!item.isSackable) return player.sendClientMessage('That item is not sackable.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(player.fullSack()) return player.sendClientMessage('Your sack is full.');

    player.addItemToSack(item);
    player.takeItemFromBelt(slot);
  }

}
