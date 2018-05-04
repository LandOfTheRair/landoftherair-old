
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class BuyMarketItem extends Command {

  public name = 'buymarketitem';
  public format = 'MarketUUID ListingId';

  async execute(player: Player, { room, args }) {
    if(!args) return false;

    const [marketUUID, listingId] = args.split(' ');
    const agent = room.state.findNPC(marketUUID);
    if(!agent) return player.sendClientMessage('That person is not here.');

    try {
      const listing = await player.$$room.marketHelper.buyItem(player, listingId);
      player.$$room.broadcastBoughtListing(listingId);

      if(listing.listingInfo.seller === player.username) {
        player.sendClientMessage(`You canceled your ${listing.itemId} listing.`);
      } else {
        player.sendClientMessage(`You bought ${listing.itemId} for ${listing.listingInfo.price.toLocaleString()} gold.`);
      }

    } catch(e) {
      player.sendClientMessage('Could not complete transaction.');

    }
  }

}
