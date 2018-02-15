
import { DB } from '../database';
import { Item, Quality } from '../../shared/models/item';
import { GameWorld } from '../rooms/GameWorld';

import { random, sampleSize, sum, sample, isArray, isNumber } from 'lodash';

const randomStats = ['str', 'dex', 'agi', 'int', 'wis', 'wil', 'con', 'cha', 'luk', 'offense', 'defense', 'armorClass'];

export class ItemCreator {

  private rollStatsForItem(potentialItem, room?: GameWorld): Item {

    if(potentialItem.trait) {
      if(isArray(potentialItem.trait.name)) {
        potentialItem.trait.name = sample(potentialItem.trait.name);
      }
      if(!isNumber(potentialItem.trait.level)) {
        const { min, max } = potentialItem.trait.level;
        potentialItem.trait.level = random(min, max);
      }
    }

    if(potentialItem.randomStats) {
      potentialItem.stats = potentialItem.stats || {};

      const allRandomStats = Object.keys(potentialItem.randomStats);

      const percentileValues = [];

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

      if(percentileValues.length > 0) {
        const overallQuality = Math.max(1, Math.floor(sum(percentileValues) / percentileValues.length));
        potentialItem.quality = overallQuality;
      }
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

    const item = await DB.$items.findOne({ name });

    if(!item) throw new Error(`Item ${name} does not exist.`);
    return this.rollStatsForItem(new Item(item), room);
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
    expiry.setHours(expiry.getHours() + hours);
    item.expiresAt = expiry.getTime();
  }

  removeItemExpiry(item: Item) {
    delete item.expiresAt;
  }

  hasItemExpired(item: Item) {
    return Date.now() > item.expiresAt;
  }
}
