
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class MerchantToRight extends Command {

  public name = '~MtR';
  public format = 'MerchantUUID ItemUUID';

  execute(player: Player, { room, gameState, args }) {

    const [containerUUID, itemUUID] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    if(!this.checkMerchantDistance(player, containerUUID)) return false;

    const item = this.checkMerchantItems(player, containerUUID, itemUUID);
    if(!item) return;

    if(player.gold < item.value) return player.sendClientMessage('You do not have enough gold for that.');

    player.loseGold(item.value);

    const newItem = new Item(item);
    newItem.regenerateUUID();

    this.trySwapRightToLeft(player);

    player.setRightHand(newItem);
  }

}
