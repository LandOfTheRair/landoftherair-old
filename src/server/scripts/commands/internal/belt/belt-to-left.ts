
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class BeltToLeft extends Command {

  public name = '~BtL';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    const slot = +args;
    if(!isUndefined(args)) return false;

    if(this.isAccessingLocker(player)) return;

    const item = player.belt.takeItemFromSlot(slot);
    if(!item) return false;

    this.trySwapLeftToRight(player);

    player.setLeftHand(item);
  }

}
