
import { DB, stringToObjectId } from '../../database';
import { Item } from '../../../shared/models/item';
import { Player } from '../../../shared/models/player';
import { MarketCalculatorHelper } from '../../../shared/helpers/market-calculator-helper';

export class MarketHelper {

  public async getListingById(id: string) {
    return DB.$marketListings.findOne({ _id: stringToObjectId(id) });
  }

  public async removeListingById(id: string) {
    return DB.$marketListings.removeOne({ _id: stringToObjectId(id) });
  }

  public async addListingPickup(forUsername: string, opts: { gold?: number, itemInfo?: any } = {}) {
    if(opts.gold) {
      return DB.$marketPickups.update({
        username: forUsername
      }, {
        $inc: { gold: opts.gold }
      }, {
        upsert: true
      });
    }

    if(opts.itemInfo) {
      return DB.$marketPickups.update({
        username: forUsername
      }, {
        $push: { items: opts.itemInfo }
      }, {
        upsert: true
      });
    }
  }

  public itemListError(player: Player, item: Item, baseItemListCost: number): string {
    if(player.$$room.subscriptionHelper.isTester(player)) return 'Test accounts cannot list items.';

    return MarketCalculatorHelper.itemListError(player, player.$$room.mapRegion, item, baseItemListCost);
  }

  public async listItem(player: Player, item: Item, baseItemListCost: number) {

    const totalListingPrice = Math.floor(MarketCalculatorHelper.calculateListingCost(player, baseItemListCost));
    player.gold -= totalListingPrice;

    player.sendClientMessage(`You've spent ${totalListingPrice.toLocaleString()} gold listing your item for sale.`);

    return DB.$marketListings.insert({
      itemId: item.name,

      itemInfo: {
        sprite: item.sprite,
        itemClass: item.itemClass,
        requirements: item.requirements,
        itemOverride: {
          quality: item.quality,
          stats: item.stats,
          trait: item.trait
        }
      },

      listingInfo: {
        listedAt: Date.now(),
        seller: player.username,
        price: baseItemListCost
      }

    });
  }

  public async buyItem(player: Player, listingId: string) {
    const listing = await this.getListingById(listingId);
    if(!listing) throw new Error('No listing to buy.');

    if(listing.listingInfo.seller === player.username) {
      await this.removeListingById(listing._id);
      await this.cancelItemListing(player, listing);
      return listing;
    }

    const cost = listing.listingInfo.price;
    if(player.gold < cost) throw new Error('Player does not have enough gold to buy.');

    player.gold -= cost;

    await this.removeListingById(listing._id);
    await this.moveTransactionToPickup(player, listing);

    return listing;
  }

  private async cancelItemListing(player: Player, listing: any) {
    listing.itemInfo.itemId = listing.itemId;
    await this.addListingPickup(player.username, { itemInfo: listing.itemInfo });
  }

  private async moveTransactionToPickup(player: Player, listing: any) {
    listing.itemInfo.itemId = listing.itemId;
    await this.addListingPickup(player.username, { itemInfo: listing.itemInfo });
    await this.addListingPickup(listing.listingInfo.seller, { gold: listing.listingInfo.price });
  }

}
