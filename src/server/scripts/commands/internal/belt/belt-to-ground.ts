
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToGround extends Command {

  public name = '~BtG';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.belt[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
    player.takeItemFromBelt(slot);
  }

}
