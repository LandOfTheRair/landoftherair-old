
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { Item } from '../../../../../shared/models/item';

export class BuybackToLeft extends Command {

  public name = '~OtL';
  public format = 'MerchantUUID ItemSlot';

  execute(player: Player, { room, args }) {

    const [containerUUID, slot] = args.split(' ');

    const container = room.state.findNPC(containerUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.buyback[+slot];
    if(!item) return player.sendClientMessage('You do not see that item.');

    if(player.gold < item._buybackValue) return player.sendClientMessage('You do not have enough gold for that.');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');

    player.buyItemBack(slot);
    player.loseGold(item._buybackValue);

    const newItem = new Item(item);

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    this.trySwapLeftToRight(player);

    player.setLeftHand(newItem);
  }

}
