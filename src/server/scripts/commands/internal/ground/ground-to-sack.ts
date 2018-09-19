
import { each } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class GroundToSack extends Command {

  public name = '~GtS';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, args }) {
    const splitArgs = args.split(' ');
    if(this.isAccessingLocker(player)) return;
    if(splitArgs.length < 1) return false;

    const [itemType, itemId] = splitArgs;

    if(itemId) {
      const item = this.getItemFromGround(player, itemType, itemId);
      if(!item) return;

      if(!this.takeItemCheck(player, item)) return;
      if(!player.addItemToSack(item)) return;
      room.removeItemFromGround(item);

    } else {
      const items = this.getItemsFromGround(player, itemType);
      if(!items) return;

      each(items, item => {
        if(!this.takeItemCheck(player, item)) return false;
        if(!player.addItemToSack(item)) return false;
        room.removeItemFromGround(item);
      });
    }
  }

}
