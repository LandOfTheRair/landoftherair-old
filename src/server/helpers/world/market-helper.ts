
import { find, extend } from 'lodash';

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

  public async numberOfListings(username: string) {
    return DB.$marketListings.find({ 'listingInfo.seller': username }).count();
  }

  public async getPickupByUsername(username: string) {
    return DB.$marketPickups.findOne({ username });
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
    player.spendGold(totalListingPrice);

    player.sendClientMessage(`You've spent ${totalListingPrice.toLocaleString()} gold listing your item for sale.`);

    return DB.$marketListings.insert({
      itemId: item.name,

      itemInfo: {
        sprite: item.sprite,
        itemClass: item.itemClass,
        requirements: item.requirements,
        uuid: item.uuid,

        // for display purposes only
        cosmetic: item.cosmetic,
        condition: item.condition,

        itemOverride: {
          enchantLevel: item.enchantLevel,
          effect: item.effect,
          quality: item.quality,
          stats: item.stats,
          trait: item.trait,
          cosmetic: item.cosmetic,
          condition: item.condition
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
    if(player.currentGold < cost) throw new Error('Player does not have enough gold to buy.');

    player.spendGold(cost);

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

  public async pickupItem(player: Player, itemUUID: string) {
    const pickupInfo = await this.getPickupByUsername(player.username);

    if(itemUUID === 'gold') {
      // tax, add to player gold
      const gainedGold = pickupInfo.gold - MarketCalculatorHelper.calculateTaxCost(player, pickupInfo.gold);
      player.earnGold(gainedGold);

      await DB.$marketPickups.update({ username: player.username }, { $set: { gold: 0 } });
    } else {
      const itemData: any = find(pickupInfo.items, { uuid: itemUUID });

      const item = await player.$$room.itemCreator.getItemByName(itemData.itemId);

      if(itemData.itemOverride.quality) item.quality = itemData.itemOverride.quality;
      if(itemData.itemOverride.enchantLevel) item.enchantLevel = itemData.itemOverride.enchantLevel;
      if(itemData.itemOverride.cosmetic) item.cosmetic = itemData.itemOverride.cosmetic;
      item.condition = itemData.itemOverride.condition || 5000;

      extend(item.effect,   itemData.itemOverride.effect);
      extend(item.trait,    itemData.itemOverride.trait);
      extend(item.stats,    itemData.itemOverride.stats);

      player.setRightHand(item);

      await DB.$marketPickups.update({ username: player.username }, { $pull: { items: { uuid: itemUUID } } });
    }
  }

}
