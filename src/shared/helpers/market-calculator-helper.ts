import { Item } from '../models/item';
import { Player } from '../models/player';

import { isNumber } from 'lodash';

export class MarketCalculatorHelper {

  static getTaxForRegion(region: string): number {
    switch(region) {
      case 'GMLand':         return 0.01;
      case 'SubscriberLand': return 0.01;
      default:               return 0.05;
    }
  }

  static getListingFeeForRegion(region: string): number {
    switch(region) {
      case 'GMLand':         return 0.01;
      case 'SubscriberLand': return 0.01;
      default:               return 0.05;
    }
  }

  static calculateListingCost(player: Player, baseCost: number): number {
    const listPercent = MarketCalculatorHelper.getListingFeeForRegion(player.$$room.mapRegion);
    return Math.max(1, Math.floor(baseCost * listPercent));
  }

  static itemListError(player: Player, item: Item, baseItemListCost: number) {
    if(!item)                                 return 'You need to have an item to list for sale!';

    if(item.itemClass === 'Corpse'
    || item.itemClass === 'Coin')             return 'Those cannot be sold on the market.';

    if(!isNumber(baseItemListCost)
    || isNaN(baseItemListCost)
    || baseItemListCost <= 0)                 return 'Invalid listing cost.';

    if(item.encrust)                          return 'Item is encrusted.';
    if(item.owner)                            return 'Item is bound.';
    if(item.quality > 0 && item.quality < 5)  return 'Item cannot be sold as-is due to RNG.';

    const gold = player.gold;

    const totalListingFee = baseItemListCost + MarketCalculatorHelper.calculateListingCost(player, baseItemListCost);

    if(gold < totalListingFee)                return 'Not enough funds to pay listing fee.';
  }
}
