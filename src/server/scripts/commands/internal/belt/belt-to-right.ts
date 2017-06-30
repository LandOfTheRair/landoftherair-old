
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class BeltToRight extends Command {

  public name = '~BtR';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;

    if(!this.checkPlayerEmptyHand(player)) return;

    const item = player.belt.takeItemFromSlot(slot);
    if(!item) return false;

    this.trySwapRightToLeft(player);

    player.setRightHand(item);
  }

}
