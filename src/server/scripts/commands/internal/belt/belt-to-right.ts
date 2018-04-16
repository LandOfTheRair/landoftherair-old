
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class BeltToRight extends Command {

  public name = '~BtR';
  public format = 'ItemSlot';

  execute(player: Player, { args }) {
    const slot = +args;
    if(isUndefined(args)) return false;
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(this.isAccessingLocker(player)) return;

    const item = player.belt.takeItemFromSlot(slot);
    if(!item) return false;

    this.trySwapLeftToRight(player);

    player.setRightHand(item);
  }

}
