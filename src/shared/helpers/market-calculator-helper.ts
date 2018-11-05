import { Item } from '../models/item';

import { isNumber, includes } from 'lodash';
import { IPlayer } from '../interfaces/character';

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
      default:               return 0.10;
    }
  }

  static calculateListingCostForRegion(baseCost: number, region: string) {
    const listPercent = MarketCalculatorHelper.getListingFeeForRegion(region);
    return Math.max(1, Math.floor(baseCost * listPercent));
  }

  static calculateListingCost(player: IPlayer, baseCost: number): number {
    return MarketCalculatorHelper.calculateListingCostForRegion(baseCost, player.$$room.mapRegion);
  }

  static calculateTaxCostForRegion(baseCost: number, region: string) {
    const listPercent = MarketCalculatorHelper.getTaxForRegion(region);
    return Math.max(1, Math.floor(baseCost * listPercent));
  }

  static calculateTaxCost(player: IPlayer, baseCost: number): number {
    return MarketCalculatorHelper.calculateTaxCostForRegion(baseCost, player.$$room.mapRegion);
  }

  static itemListError(player: IPlayer, region: string, item: Item, baseItemListCost: number) {
    if(!item)                                 return 'You need to have an item to list for sale!';

    if(item.itemClass === 'Corpse'
    || item.itemClass === 'Coin')             return 'Those cannot be sold on the market.';

    if(!isNumber(baseItemListCost)
    || isNaN(baseItemListCost)
    || baseItemListCost <= 0)                 return 'Invalid listing cost.';

    if(item.encrust)                          return 'Item is encrusted, and cannot be sold.';
    if(item.owner)                            return 'Item is bound, and cannot be sold.';

    const gold = player.currentGold;

    const totalListingFee = MarketCalculatorHelper.calculateListingCostForRegion(baseItemListCost, region);

    if(gold < totalListingFee)                return 'Not enough funds to pay listing fee.';

    if(includes(item.name, '(Filled')) return 'Item is filled with strange liquid, and the market does not want to be responsible.';
  }
}
