
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class PickupMarketItem extends Command {

  public name = 'pickupmarketitem';
  public format = 'MarketUUID ItemUUID';

  async execute(player: Player, { room, args }) {
    if(!args) return false;

    const [marketUUID, itemUUID] = args.split(' ');
    const agent = room.state.findNPC(marketUUID);
    if(!agent) return player.sendClientMessage('That person is not here.');

    if(player.rightHand) return player.sendClientMessage('You must empty your right hand first.');
    if(player.$$isAccessingLocker) return player.sendClientMessage('You are busy.');

    player.$$isAccessingLocker = true;

    try {
      await player.$$room.marketHelper.pickupItem(player, itemUUID);

    } catch(e) {
      console.error(e);
      player.sendClientMessage('Could not complete transaction.');

    }

    player.$$isAccessingLocker = false;
  }

}
