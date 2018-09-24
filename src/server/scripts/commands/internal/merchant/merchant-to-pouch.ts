
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { Item } from '../../../../../shared/models/item';

export class MerchantToPouch extends Command {

  public name = '~MtD';
  public format = 'MerchantUUID ItemUUID Quantity';

  execute(player: Player, { args }) {

    const [containerUUID, itemUUID, quantityCheck] = args.split(' ');
    const quantity = Math.round(+quantityCheck);
    if(quantity < 0) return false;

    if(!this.checkMerchantDistance(player, containerUUID)) return;

    const item = this.checkMerchantItems(player, containerUUID, itemUUID);
    if(!item) return;

    if(!item.isSackable) return player.sendClientMessage('That item is not sackable, cheater.');

    let maxQuantity = Math.min(quantity, player.pouch.size - player.pouch.allItems.length);

    if(item.daily) {
      if(!player.canBuyDailyItem(item)) return player.sendClientMessage('Sorry, that\'s sold out at the moment. Check back tomorrow!');
      maxQuantity = 1;
    }

    for(let i = 0; i < maxQuantity; i++) {
      if(player.currentGold < item.value) {
        if(i === 0) player.sendClientMessage('You do not have enough currentGold for that.');
        return;
      }

      player.spendGold(item.value, `Buy:${item.name}`);

      if(item.daily) player.buyDailyItem(item);

      const newItem = new Item(item, { doRegenerate: true });

      player.addItemToPouch(newItem);
    }
  }

}
