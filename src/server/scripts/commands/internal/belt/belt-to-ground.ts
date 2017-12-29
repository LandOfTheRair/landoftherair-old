
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class BeltToGround extends Command {

  public name = '~BtG';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;

    if(this.isAccessingLocker(player)) return;


    const item = player.belt.takeItemFromSlot(slot);
    if(!item) return;

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
  }

}
