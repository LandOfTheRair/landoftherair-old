
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { Item } from '../../../../../shared/models/item';

export class MerchantToSack extends Command {

  public name = '~MtS';
  public format = 'MerchantUUID ItemUUID Quantity';

  execute(player: Player, { room, gameState, args }) {

    const [containerUUID, itemUUID, quantityCheck] = args.split(' ');
    const quantity = Math.round(+quantityCheck);
    if(quantity < 0) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.checkMerchantDistance(player, containerUUID)) return;

    const item = this.checkMerchantItems(player, containerUUID, itemUUID);
    if(!item) return;

    if(!item.isSackable) return player.sendClientMessage('That item is not sackable, cheater.');

    const maxQuantity = Math.min(quantity, player.sack.size - player.sack.allItems.length);

    for(let i = 0; i < maxQuantity; i++) {
      if(player.gold < item.value) {
        if(i === 0) player.sendClientMessage('You do not have enough gold for that.');
        return;
      }

      player.loseGold(item.value);

      const newItem = new Item(item);
      newItem.regenerateUUID();

      player.addItemToSack(newItem);
    }
  }

}
