
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class MerchantToBelt extends Command {

  public name = '~MtB';
  public format = 'MerchantUUID ItemUUID Quantity';

  execute(player: Player, { room, gameState, args }) {

    let [containerUUID, itemUUID, quantity] = args.split(' ');
    quantity = Math.round(+quantity);
    if(quantity < 0) return false;

    const container = room.state.findNPC(containerUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    if(container.distFrom(player) > 2) return player.sendClientMessage('That person is too far away.');

    const item = find(container.vendorItems, { uuid: itemUUID });
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(!item.isBeltable) return player.sendClientMessage('That item is not sackable, cheater.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    const maxQuantity = Math.min(quantity, player.beltSize() - player.belt.length);

    for(let i = 0; i < maxQuantity; i++) {
      if(player.gold < item.value) return player.sendClientMessage('You do not have enough gold for that.');

      player.loseGold(item.value);

      const newItem = new Item(item);
      newItem.regenerateUUID();

      player.addItemToBelt(item);
    }
  }

}
