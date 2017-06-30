
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class SackToRight extends Command {

  public name = '~StR';
  public format = 'ItemSlot';

  execute(player: Player, { room, gameState, args }) {
    const slot = +args;

    if(!this.checkPlayerEmptyHand(player)) return;

    const item = player.sack.takeItemFromSlot(slot);
    if(!item) return false;

    this.trySwapRightToLeft(player);

    player.setRightHand(item);
  }

}
