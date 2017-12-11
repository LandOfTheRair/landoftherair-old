
import { reject, difference } from 'lodash';

import { SkillClassNames, Stats } from '../../shared/models/character';
import * as Classes from '../classes';
import * as Effects from '../effects';

const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });

import { DB } from '../database';

import * as YAML from 'yamljs';
import * as recurse from 'recursive-readdir';
import * as path from 'path';

import { includes, flatten, isUndefined, capitalize } from 'lodash';

import {
  Item, ValidItemTypes, WeaponClasses, ArmorClasses
} from '../../shared/models/item';

class ItemLoader {

  static async loadAllItems() {
    await DB.isReady;

    recurse(`${__dirname}/../data/items`).then(async files => {
      const filePromises = files.map(file => {
        const fileName = path.basename(file, path.extname(file));
        const itemsOfType = YAML.load(file);

        const promises = itemsOfType.map(itemData => {
          itemData.itemClass = fileName;
          itemData.type = itemData.type || SkillClassNames.Martial;
          if(!itemData.stats) itemData.stats = {};

          return new Promise((resolve, reject) => {
            this.conditionallyAddInformation(itemData);
            if(!this.validateItem(itemData)) return reject(new Error(`${itemData.name} failed validation.`));
            return resolve(itemData);
          });

        });

        return promises;
      });

      try {
        const allItemData = await Promise.all(flatten(filePromises));

        console.log('Validated all items.');

        await DB.$items.remove({}, { multi: true });

        console.log('Removed old items.');

        const allItemDataPromises = allItemData.map((itemData: any) => {
          return DB.$items.insert(itemData);
        });

        await Promise.all(flatten(allItemDataPromises));

        console.log('Inserted all items.');

      } catch(e) {
        console.error(e);
        process.exit(-1);
      }

      Promise.all(flatten(filePromises)).then(() => {
        console.log('Done');
        process.exit(0);
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

    if(item.itemClass === 'Twig') {
      item.type = 'Staff';
    }

    if(item.itemClass === 'Tunic') {
      item.isSackable = true;
    }

    if(item.type === 'Polearm') {
      item.isBeltable = false;
      item.twoHanded = true;
      item.attackRange = 1;
    }

    if(item.type === 'Twohanded' || item.secondaryType === 'Twohanded') {
      item.twoHanded = true;
      item.proneChance = 5;
    }

    if(includes(['Shortbow', 'Longbow'], item.itemClass)) {
      item.twoHanded = true;
    }

    if(includes(['Crossbow', 'Shortbow', 'Longbow'], item.itemClass)) {
      item.attackRange = 4;
    }

    if(item.itemClass === 'Shield') {
      if(!item.stats.accuracy) item.stats.accuracy = 0;
    }

    if(item.itemClass === 'Bottle' || item.itemClass === 'Food') {
      item.ounces = item.ounces || 1;
    }

    if(!item.baseDamage) item.baseDamage = 1;
    if(!item.maxDamage) item.maxDamage = 1;
    if(!item.minDamage) item.minDamage = 1;
    if(!item.damageRolls) item.damageRolls = 1;

    item.type = capitalize(item.type);
    if(item.secondaryType) item.secondaryType = capitalize(item.secondaryType);
  }

  static validateItem(item: Item): boolean {
    let hasBad = false;

    if(!item.name)                            { console.error(`ERROR: ${JSON.stringify(item)} has no name!`); hasBad = true; }
    if(!item.desc)                            { console.error(`ERROR: ${item.name} has no description!`); hasBad = true; }
    if(!item.sprite)                          { console.error(`ERROR: ${item.name} has no sprite!`); hasBad = true; }
    if(!includes(ValidItemTypes, item.type))  { console.error(`ERROR: ${item.name} has an invalid item type!`); hasBad = true; }

    if(item.requirements && item.requirements.profession) {
      const invalidClasses = reject(item.requirements.profession, testClass => Classes[testClass]);
      if(invalidClasses.length > 0) {
        console.error(`ERROR: ${item.name} has invalid class requirements: ${invalidClasses.join(', ')}`);
        hasBad = true;
      }
    }

    if(item.stats) {
      const statsTest = new Stats();
      const invalidStats = difference(Object.keys(item.stats), Object.keys(statsTest));
      if(invalidStats.length > 0 && invalidStats[0] !== 'effect') {
        console.error(`ERROR: ${item.name} has invalid stats: ${invalidStats.join(', ')}`);
        hasBad = true;
      }
    }

    if(item.effect && !Effects[item.effect.name] && !item.effect.uses) {
      console.error(`ERROR: ${item.name} has an invalid effect: ${item.effect.name}`);
      hasBad = true;
    }

    if(hasBad) {
      throw new Error('Invalid item. Stopping.');
    }

    return true;
  }

}

ItemLoader.loadAllItems();
