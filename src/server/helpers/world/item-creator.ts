
import * as Cache from 'node-cache';

import { DB } from '../../database';
import { Item, Quality } from '../../../shared/models/item';
import { GameWorld } from '../../rooms/GameWorld';

import { random, sampleSize, sum, sample, isArray, isNumber, includes } from 'lodash';

const isProd = process.env.NODE_ENV === 'production';

const randomStats = ['str', 'dex', 'agi', 'int', 'wis', 'wil', 'con', 'cha', 'luk', 'offense', 'defense', 'armorClass'];

export class ItemCreator {

  private cache = new Cache({ stdTTL: 600 });

  private rollStatsForItem(potentialItem, room?: GameWorld): Item {

    const percentileValues = [];

    if(potentialItem.trait) {
      if(isArray(potentialItem.trait.name)) {
        potentialItem.trait.name = sample(potentialItem.trait.name);
      }
      if(!isNumber(potentialItem.trait.level)) {
        const { min, max } = potentialItem.trait.level;
        const rolled = random(min, max);

        potentialItem.trait.level = rolled;

        let percentileRank = +(((rolled) / (max)) / 0.25).toFixed(0);
        if(percentileRank <= 0) percentileRank = 1;

        percentileValues.push(rolled === max ? Quality.PERFECT : percentileRank);
      }
    }

    if(potentialItem.randomStats) {
      potentialItem.stats = potentialItem.stats || {};

      const allRandomStats = Object.keys(potentialItem.randomStats);

      allRandomStats.forEach(randomStat => {
        const { min, max } = potentialItem.randomStats[randomStat];
        const rolled = random(min, max);

        if(isNaN(rolled)) return;

        potentialItem.stats[randomStat] = potentialItem.stats[randomStat] || 0;
        potentialItem.stats[randomStat] += rolled;

        let percentileRank = +(((rolled) / (max)) / 0.25).toFixed(0);
        if(percentileRank <= 0) percentileRank = 1;

        percentileValues.push(rolled === max ? Quality.PERFECT : percentileRank);
      });
    }

    if(percentileValues.length > 0) {
      const overallQuality = Math.max(1, Math.floor(sum(percentileValues) / percentileValues.length));
      potentialItem.quality = Math.max(1, overallQuality);
    }

    if(room) {
      const { numberOfRandomStatsForItems, randomStatMaxValue, randomStatChance } = room.getRandomStatInformation();
      if(numberOfRandomStatsForItems > 0 && randomStatMaxValue > 0 && random(1, 1000000) <= randomStatChance) {
        const chosenStats = sampleSize(randomStats, numberOfRandomStatsForItems);

        chosenStats.forEach(stat => {
          potentialItem.stats[stat] = potentialItem.stats[stat] || 0;
          potentialItem.stats[stat] += random(0, randomStatMaxValue);
        });
      }
    }

    delete potentialItem.randomStats;
    return potentialItem;
  }

  async getItemByName(name: string, room?: GameWorld): Promise<Item> {

    if(name === 'none') return Promise.resolve(null);

    let createItemName = name;
    if(includes(name, 'Vial of Blood')) createItemName = 'Vial of Blood';
    if(includes(name, 'Runewritten Scroll')) createItemName = 'Runewritten Scroll';

    const finalizeItem = (itemData) => {
      const createdItem = new Item(itemData);
      this.rollStatsForItem(createdItem, room);

      if(name !== createItemName) createdItem.name = name;

      return createdItem;
    };

    const data = this.cache.get(createItemName);
    if(data) return finalizeItem(data);

    const item = await DB.$items.findOne({ name: createItemName });
    if(!item) throw new Error(`Item ${createItemName} does not exist.`);

    if(isProd) this.cache.set(createItemName, item);

    return finalizeItem(item);
  }

  async getRecipe(query: any): Promise<any> {
    return DB.$recipes.findOne(query);
  }

  searchItems(name: string): Promise<Item[]> {
    const regex = new RegExp(`.*${name}.*`, 'i');
    return DB.$items.find({ name: regex }).toArray();
  }

  async getGold(value: number): Promise<Item> {
    const item = await this.getItemByName('Gold Coin');
    item.value = value;
    return item;
  }

  setItemExpiry(item: Item, hours = 1) {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + (hours * 60));
    item.expiresAt = expiry.getTime();
  }

  removeItemExpiry(item: Item) {
    delete item.expiresAt;
  }

  hasItemExpired(item: Item) {
    return Date.now() > item.expiresAt;
  }

  duplicateItem(item: Item) {
    return new Item(item, { doRegenerate: true });
  }
}
