
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { Item } from '../../../../../shared/models/item';

export class MerchantToRight extends Command {

  public name = '~MtR';
  public format = 'MerchantUUID ItemUUID';

  execute(player: Player, { args }) {

    const [containerUUID, itemUUID] = args.split(' ');
    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    if(!this.checkMerchantDistance(player, containerUUID)) return;

    const item = this.checkMerchantItems(player, containerUUID, itemUUID);
    if(!item) return;

    if(player.gold < item.value) return player.sendClientMessage('You do not have enough gold for that.');

    if(item.daily) {
      if(!player.canBuyDailyItem(item)) return player.sendClientMessage('Sorry, that\'s sold out at the moment. Check back tomorrow!');
      player.buyDailyItem(item);
    }

    player.loseGold(item.value);

    const newItem = new Item(item);
    newItem.regenerateUUID();

    this.trySwapRightToLeft(player);

    player.setRightHand(newItem);
  }

}
