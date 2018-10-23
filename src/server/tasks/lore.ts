
import { find } from 'lodash';

const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });

import { DB } from '../database';

const DROP_RATE_MAX = 10000;

class LoreLoader {

  static async loadAllLore() {
    await DB.init();

    const allPromises = [];

    try {
      const allItemData = await DB.$items.find({}).toArray();
      const allMapDropData = await DB.$mapDrops.find({}).toArray();
      const allRegionDropData = await DB.$regionDrops.find({}).toArray();
      const allRecipeData = await DB.$recipes.find({}).toArray();

      allPromises.push(...LoreLoader.allGemDescInserts(allItemData, allMapDropData, allRegionDropData));

      console.log('Inserted all gem description scrolls')

      allPromises.push(...LoreLoader.allRecipeScrollInserts(allItemData, allMapDropData, allRegionDropData, allRecipeData));

      console.log('Inserted all recipe scrolls')

      /*
      const allGemLorePromises = allItemData.map((itemData: any) => {
        return DB.$items.insert(itemData);
      });

      await Promise.all(allItemDataPromises);

      console.log('Inserted all lore.');
      */

    } catch(e) {
      console.error(e);
      process.exit(-1);
    }

    Promise.all(allPromises).then(() => {
      console.log('Done');
      process.exit(0);
    });
  }

  static allGemDescInserts(itemData, mapDropData, regionDropData): Promise<any>[] {

    const promises = [];

    const allGems = itemData.filter(x => x.itemClass === 'Gem');
    const allGemScrollDescs = allGems.map(x => {
      const allKeys = Object.keys(x.stats).filter(z => z !== 'effect').map(z => z.toUpperCase());

      let effectText = `boost your ${allKeys.join(', ')}`;

      if(allKeys.length === 0) {
        if(x.effect) {
          effectText = `grant the spell ${x.effect.name.toUpperCase()} when used`;
        } else if(x.stats.effect) {
          effectText = `grant the spell ${x.stats.effect.name.toUpperCase()} when encrusted`;
        } else {
          effectText = `sell for a lot of gold`;
        }
      }

      const bonusText = x.maxEncrusts ? `- be careful, it can only be used ${x.maxEncrusts} times, though` : '';

      return {
        _itemName: x.name,
        scrollDesc: `Twean's Gem Codex: If you find ${x.desc}, it will ${effectText} ${bonusText}`
      };

    });

    allGemScrollDescs.forEach(gemScrollDesc => {

      const itemName = `Lore Scroll - Gem - ${gemScrollDesc._itemName}`;

      promises.push(DB.$items.insert({
        name: itemName,
        sprite: 224,
        value: 1,
        desc: gemScrollDesc.scrollDesc,
        itemClass: 'Scroll',
        type: 'Martial'
      }).catch(e => {}));

      mapDropData.forEach(({ mapName, drops }) => {
        drops.forEach(item => {
          if(item.result === gemScrollDesc._itemName) {
            promises.push(DB.$mapDrops.update({ mapName: mapName }, { $addToSet: { drops: { result: itemName, chance: 1, maxChance: DROP_RATE_MAX } } }).catch(e => {}));
          }
        });
      });

      regionDropData.forEach(({ regionName, drops }) => {
        drops.forEach(item => {
          if(item.result === gemScrollDesc._itemName) {
            promises.push(DB.$regionDrops.update({ regionName: regionName }, { $addToSet: { drops: { result: itemName, chance: 1, maxChance: DROP_RATE_MAX } } }).catch(e => {}));
          }
        });
      });
    });

    return promises;
  }

  static allRecipeScrollInserts(itemData, mapDropData, regionDropData, recipeData): Promise<any>[] {

    const promises = [];

    const allIngScrollDescs = recipeData.map(x => {

      let leader = 'Someone\'s Book';

      switch(x.recipeType) {
        case 'alchemy': { leader = 'Selen\'s Alchemical Guide'; break; }
        case 'metalworking': { leader = 'Pandira\'s Hammer Teachings'; break; }
      }

      const itemDesc = (<any>find(itemData, { name: x.item })).desc;
      const ingredientDescs = x.ingredients.map(ing => find(itemData, { name: ing })).map(i => i.desc);

      return {
        _itemName: x.item,
        scrollDesc: `${leader}: If you want to make ${itemDesc}, you must mix these ${ingredientDescs.length} items: ${ingredientDescs.join(', ')}`
      };

    });


    allIngScrollDescs.forEach(ingScrollDesc => {

      const itemName = `Lore Scroll - Crafting - ${ingScrollDesc._itemName}`;

      promises.push(DB.$items.insert({
        name: itemName,
        sprite: 224,
        value: 1,
        desc: ingScrollDesc.scrollDesc,
        itemClass: 'Scroll',
        type: 'Martial'
      }).catch(e => {}));

      regionDropData.forEach(({ regionName }) => {
        promises.push(DB.$regionDrops.update({ regionName: regionName }, { $addToSet: { drops: { result: itemName, chance: 1, maxChance: DROP_RATE_MAX } } }).catch(e => {}));
      });
    });

    return promises;
  }

}

LoreLoader.loadAllLore();
