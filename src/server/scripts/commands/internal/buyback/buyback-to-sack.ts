
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { Item } from '../../../../../shared/models/item';

export class BuybackToSack extends Command {

  public name = '~OtS';
  public format = 'MerchantUUID ItemSlot';

  execute(player: Player, { room, args }) {

    const [containerUUID, slot] = args.split(' ');

    const container = room.state.findNPC(containerUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.buyback[+slot];
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(player.currentGold < item._buybackValue) return player.sendClientMessage('You do not have enough currentGold for that.');

    const newItem = new Item(item);

    if(!player.addItemToSack(newItem)) return;

    player.buyItemBack(slot);

  }

}
