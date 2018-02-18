
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PouchToRight extends Command {

  public name = '~DtR';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;



    const item = player.pouch.takeItemFromSlot(slot);
    if(!item) return false;

    this.trySwapRightToLeft(player);

    player.setRightHand(item);
  }

}
