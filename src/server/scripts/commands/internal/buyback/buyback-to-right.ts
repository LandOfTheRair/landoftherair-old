
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { Item } from '../../../../../shared/models/item';

export class BuybackToRight extends Command {

  public name = '~OtR';
  public format = 'MerchantUUID ItemSlot';

  execute(player: Player, { room, args }) {

    const [containerUUID, slot] = args.split(' ');

    const container = room.state.findNPC(containerUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.buyback[+slot];
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(player.currentGold < item._buybackValue) return player.sendClientMessage('You do not have enough currentGold for that.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    player.buyItemBack(slot);

    const newItem = new Item(item);

    this.trySwapRightToLeft(player);

    player.setRightHand(newItem);
  }

}
