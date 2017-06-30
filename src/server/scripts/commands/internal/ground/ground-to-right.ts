
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class GroundToRight extends Command {

  public name = '~GtR';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 2) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    const [itemType, itemId] = splitArgs;
    const item = this.getItemFromGround(player, itemType, itemId);
    if(!item) return;

    this.trySwapRightToLeft(player);

    player.setRightHand(item);
    room.removeItemFromGround(item);
  }

}
