
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class SackToGround extends Command {

  public name = '~StG';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;



    const item = player.sack.takeItemFromSlot(slot);
    if(!item) return;

    room.addItemToGround(player, item);
    room.showGroundWindow(player);
  }

}
