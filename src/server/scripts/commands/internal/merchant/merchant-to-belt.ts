
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { Item } from '../../../../../shared/models/item';

export class MerchantToBelt extends Command {

  public name = '~MtB';
  public format = 'MerchantUUID ItemUUID Quantity';

  execute(player: Player, { room, gameState, args }) {

    const [containerUUID, itemUUID, quantityCheck] = args.split(' ');
    const quantity = Math.round(+quantityCheck);
    if(quantity < 0) return false;

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.checkMerchantDistance(player, containerUUID)) return;

    const item = this.checkMerchantItems(player, containerUUID, itemUUID);
    if(!item) return;

    if(!item.isBeltable) return player.sendClientMessage('That item is not beltable, cheater.');

    const maxQuantity = Math.min(quantity, player.belt.size - player.belt.allItems.length);

    for(let i = 0; i < maxQuantity; i++) {
      if(player.gold < item.value) return player.sendClientMessage('You do not have enough gold for that.');

      player.loseGold(item.value);

      const newItem = new Item(item);
      newItem.regenerateUUID();

      player.addItemToBelt(newItem);
    }
  }

}
