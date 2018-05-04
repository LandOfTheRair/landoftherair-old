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

  static calculateListingCostForRegion(baseCost: number, region: string) {
    const listPercent = MarketCalculatorHelper.getListingFeeForRegion(region);
    return Math.max(1, Math.floor(baseCost * listPercent));
  }

  static calculateListingCost(player: Player, baseCost: number): number {
    return MarketCalculatorHelper.calculateListingCostForRegion(baseCost, player.$$room.mapRegion);
  }

  static itemListError(player: Player, region: string, item: Item, baseItemListCost: number) {
    if(!item)                                 return 'You need to have an item to list for sale!';

    if(item.itemClass === 'Corpse'
    || item.itemClass === 'Coin')             return 'Those cannot be sold on the market.';

    if(!isNumber(baseItemListCost)
    || isNaN(baseItemListCost)
    || baseItemListCost <= 0)                 return 'Invalid listing cost.';

    if(item.encrust)                          return 'Item is encrusted, and cannot be sold.';
    if(item.owner)                            return 'Item is bound, and cannot be sold.';

    const gold = player.gold;

    const totalListingFee = baseItemListCost + MarketCalculatorHelper.calculateListingCostForRegion(baseItemListCost, region);

    if(gold < totalListingFee)                return 'Not enough funds to pay listing fee.';
  }
}
