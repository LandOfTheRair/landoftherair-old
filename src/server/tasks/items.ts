
import { Stats } from '../../models/character';
require('dotenv').config({ silent: true });

import { DB } from '../database';

import * as YAML from 'yamljs';
import * as recurse from 'recursive-readdir';
import * as path from 'path';

import { includes, flatten, isUndefined } from 'lodash';

import {
  Item, ValidItemTypes, WeaponClasses, ArmorClasses
} from '../../models/item';

class ItemLoader {

  static loadAllItems() {
    DB.isReady.then(async () => {
      await DB.$items.remove({}, { multi: true });

      recurse(`${__dirname}/../items`).then(files => {
        const filePromises = files.map(file => {
          const fileName = path.basename(file, path.extname(file));
          const itemsOfType = YAML.load(file);

          const promises = itemsOfType.map(itemData => {
            itemData.itemClass = fileName;
            itemData.type = itemData.type || 'Martial';
            if(!itemData.stats) itemData.stats = {};
            this.conditionallyAddInformation(itemData);
            if(!this.validateItem(itemData)) return;

            console.log(`Inserting ${itemData.name}`);
            return DB.$items.insert(itemData);
          });

          return promises;
        });

        Promise.all(flatten(filePromises)).then(() => {
          console.log('Done');
          process.exit(0);
        });
      });
    });
  }

  static isWeapon(item: Item) {
    return includes(WeaponClasses, item.itemClass);
  }

  static isArmor(item: Item) {
    return includes(ArmorClasses, item.itemClass);
  }

  static conditionallyAddInformation(item: Item) {
    if(this.isWeapon(item)) {
      if(isUndefined(item.isBeltable))  item.isBeltable = true;
      if(isUndefined(item.isSackable))  item.isSackable = false;

      if(!item.maxDamage) item.maxDamage = item.baseDamage;
    }

    if(this.isArmor(item)) {
      if(isUndefined(item.isBeltable))  item.isBeltable = false;
      if(isUndefined(item.isSackable))  item.isSackable = false;
    }

    if(item.itemClass === 'Halberd') {
      item.isBeltable = false;
      item.twoHanded = true;
      item.attackRange = 1;
    }

    if(includes(['Shortbow', 'Longbow'], item.itemClass)) {
      item.twoHanded = true;
    }

    if(includes(['Crossbow', 'Shortbow', 'Longbow'], item.itemClass)) {
      item.attackRange = 4;
    }

    if(item.itemClass === 'Shield') {
      if(!item.stats.accuracy) item.stats.accuracy = 1;
      item.baseDamage = 1;
    }

    if(item.itemClass === 'Bottle') {
      item.ounces = item.ounces || 1;
    }

    // TODO check effect, if it is an array, then pick a random value between 0 and 1
  }

  static validateItem(item: Item): boolean {
    if(!item.name)                            { console.error(`ERROR: ${JSON.stringify(item)} has no name!`); return false; }
    if(!item.desc)                            { console.error(`ERROR: ${item.name} has no description!`); return false; }
    if(!item.sprite)                          { console.error(`ERROR: ${item.name} has no sprite!`); return false; }
    if(!includes(ValidItemTypes, item.type))  { console.error(`ERROR: ${item.name} has an invalid item type!`); return false; }

    return true;

    // TODO validate class requirements against real classes
    // TODO validate stats against real stats
  }

}

ItemLoader.loadAllItems();
