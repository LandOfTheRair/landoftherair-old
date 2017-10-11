
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class GroundToRight extends Command {

  public name = '~GtR';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, gameState, args }) {
    const splitArgs = args.split(' ');
    if(splitArgs.length < 1) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    const [itemType, itemId] = splitArgs;

    let item = null;
    if(itemId) {
      item = this.getItemFromGround(player, itemType, itemId);
    }
    if(!item) {
      const items = this.getItemsFromGround(player, itemType);
      if(!items) return;
      item = items[0];
    }

    if(!item) return;

    this.trySwapRightToLeft(player);

    player.setRightHand(item);
    room.removeItemFromGround(item);
  }

}
