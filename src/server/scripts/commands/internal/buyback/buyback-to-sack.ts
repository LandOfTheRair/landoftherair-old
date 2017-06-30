
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { Item } from '../../../../../models/item';

export class BuybackToSack extends Command {

  public name = '~OtS';
  public format = 'MerchantUUID ItemSlot';

  execute(player: Player, { room, gameState, args }) {

    const [containerUUID, slot] = args.split(' ');

    if(!this.checkPlayerEmptyHand(player)) return;

    const container = room.state.findNPC(containerUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.buyback[+slot];
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(player.gold < item._buybackValue) return player.sendClientMessage('You do not have enough gold for that.');

    const newItem = new Item(item);

    if(!player.addItemToSack(newItem)) return;

    player.buyItemBack(slot);
    player.loseGold(item._buybackValue);

  }

}
