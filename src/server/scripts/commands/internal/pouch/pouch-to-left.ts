
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PouchToLeft extends Command {

  public name = '~DtL';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;



    const item = player.pouch.takeItemFromSlot(slot);
    if(!item) return false;

    this.trySwapLeftToRight(player);

    player.setLeftHand(item);
  }

}
