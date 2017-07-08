
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class MerchantToPotion extends Command {

  public name = '~MtP';
  public format = 'MerchantUUID ItemUUID';

  execute(player: Player, { room, gameState, args }) {

    const [containerUUID, itemUUID] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.checkMerchantDistance(player, containerUUID)) return false;

    const item = this.checkMerchantItems(player, containerUUID, itemUUID);
    if(!item) return;

    if(item.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    if(player.gold < item.value) return player.sendClientMessage('You do not have enough gold for that.');

    player.loseGold(item.value);

    const newItem = new Item(item);
    newItem.regenerateUUID();

    player.setPotionHand(newItem);
  }

}
