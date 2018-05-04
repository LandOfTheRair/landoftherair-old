
import { DB } from '../../database';
import { Item } from '../../../shared/models/item';
import { Player } from '../../../shared/models/player';
import { MarketCalculatorHelper } from '../../../shared/helpers/market-calculator-helper';

export class MarketHelper {

  public async getListingById(id: string) {
    return DB.$marketListings.find({ _id: id });
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
        quality: item.quality,
        sprite: item.sprite,
        itemClass: item.itemClass,
        requirements: item.requirements
      },

      listingInfo: {
        listedAt: Date.now(),
        seller: player.username,
        price: baseItemListCost
      }

    });
  }

}
