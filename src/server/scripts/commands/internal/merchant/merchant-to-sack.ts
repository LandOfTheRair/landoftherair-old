
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class MerchantToSack extends Command {

  public name = '~MtS';
  public format = 'MerchantUUID ItemUUID Quantity';

  execute(player: Player, { room, gameState, args }) {

    let [containerUUID, itemUUID, quantity] = args.split(' ');
    quantity = Math.round(+quantity);
    if(quantity < 0) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.checkMerchantDistance(player, containerUUID)) return;

    const item = this.checkMerchantItems(player, containerUUID, itemUUID);
    if(!item) return;

    if(!item.isSackable) return player.sendClientMessage('That item is not sackable, cheater.');

    const maxQuantity = Math.min(quantity, player.sack.size - player.sack.items.length);

    for(let i = 0; i < maxQuantity; i++) {
      if(player.gold < item.value) return player.sendClientMessage('You do not have enough gold for that.');

      player.loseGold(item.value);

      const newItem = new Item(item);
      newItem.regenerateUUID();

      player.addItemToSack(newItem);
    }
  }

}
