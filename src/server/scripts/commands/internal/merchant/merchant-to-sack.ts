
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class MerchantToSack extends Command {

  public name = '~MtS';
  public format = 'MerchantUUID ItemUUID Quantity';

  execute(player: Player, { room, client, gameState, args }) {

    let [containerUUID, itemUUID, quantity] = args.split(' ');
    quantity = Math.round(+quantity);
    if(quantity < 0) return false;

    const container = room.state.findNPC(containerUUID);
    if(!container) return room.sendClientLogMessage(client, 'That person is not here.');

    const item = find(container.vendorItems, { uuid: itemUUID });
    if(!item) return room.sendClientLogMessage(client, 'You do not see that item.');

    if(!item.isSackable) return room.sendClientLogMessage(client, 'That item is not sackable, cheater.');

    if(!player.hasEmptyHand()) return room.sendClientLogMessage(client, 'Your hands are full.');

    const maxQuantity = Math.min(quantity, player.sackSize() - player.sack.length);

    for(let i = 0; i < maxQuantity; i++) {
      if(player.gold < item.value) return room.sendClientLogMessage(client, 'You do not have enough gold for that.');

      player.loseGold(item.value);

      const newItem = new Item(item);
      newItem.regenerateUUID();

      player.addItemToSack(item);
    }
  }

}
