
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class SackToRight extends Command {

  public name = '~StR';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;
    const slot = +args;
    if(isUndefined(slot)) return false;

    const item = player.sack.takeItemFromSlot(slot);
    if(!item) return false;

    this.trySwapRightToLeft(player);

    player.setRightHand(item);
  }

}
