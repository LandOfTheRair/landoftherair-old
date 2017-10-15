
import { DB } from '../database';
import { Item } from '../../shared/models/item';
import { GameWorld } from '../rooms/GameWorld';

import { random, sampleSize } from 'lodash';

const randomStats = ['str', 'dex', 'agi', 'int', 'wis', 'wil', 'con', 'cha', 'luk', 'offense', 'defense', 'armorClass'];

export class ItemCreator {

  private static rollStatsForItem(potentialItem, room?: GameWorld): Item {

    if(potentialItem.randomStats) {
      potentialItem.stats = potentialItem.stats || {};
      Object.keys(potentialItem.randomStats).forEach(randomStat => {
        potentialItem.stats[randomStat] = potentialItem.stats[randomStat] || 0;

        const { min, max } = potentialItem.randomStats[randomStat];
        const rolled = random(min, max);

        if(isNaN(rolled) || rolled === 0) return;

        potentialItem.stats[randomStat] += rolled;
      });
    }

    if(room) {
      const { numberOfRandomStatsForItems, randomStatMaxValue, randomStatChance } = room.getRandomStatInformation();
      if(numberOfRandomStatsForItems > 0 && randomStatMaxValue > 0 && random(1, 100) < randomStatChance) {
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

  static getItemByName(name: string, room?: GameWorld): Promise<Item> {
    return DB.$items.findOne({ name }).then(item => {
      if(!item) throw new Error(`Item ${name} does not exist.`);
      return this.rollStatsForItem(new Item(item), room);
    });
  }

  static searchItems(name: string): Promise<Item[]> {
    const regex = new RegExp(`.*${name}.*`, 'i');
    return DB.$items.find({ name: regex }).toArray();
  }

  static async getGold(value: number): Promise<Item> {
    const item = await this.getItemByName('Gold Coin');
    item.value = value;
    return item;
  }
}
