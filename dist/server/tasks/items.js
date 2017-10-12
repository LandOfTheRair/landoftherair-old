"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const character_1 = require("../../models/character");
const Classes = require("../classes");
const Effects = require("../effects");
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });
const database_1 = require("../database");
const YAML = require("yamljs");
const recurse = require("recursive-readdir");
const path = require("path");
const lodash_2 = require("lodash");
const item_1 = require("../../models/item");
class ItemLoader {
    static loadAllItems() {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.DB.isReady;
            yield database_1.DB.$items.remove({}, { multi: true });
            recurse(`${__dirname}/../data/items`).then(files => {
                const filePromises = files.map(file => {
                    const fileName = path.basename(file, path.extname(file));
                    const itemsOfType = YAML.load(file);
                    const promises = itemsOfType.map(itemData => {
                        itemData.itemClass = fileName;
                        itemData.type = itemData.type || character_1.SkillClassNames.Martial;
                        if (!itemData.stats)
                            itemData.stats = {};
                        this.conditionallyAddInformation(itemData);
                        if (!this.validateItem(itemData))
                            return;
                        console.log(`Inserting ${itemData.name}`);
                        return database_1.DB.$items.insert(itemData);
                    });
                    return promises;
                });
                Promise.all(lodash_2.flatten(filePromises)).then(() => {
                    console.log('Done');
                    process.exit(0);
                });
            });
        });
    }
    static isWeapon(item) {
        return lodash_2.includes(item_1.WeaponClasses, item.itemClass);
    }
    static isArmor(item) {
        return lodash_2.includes(item_1.ArmorClasses, item.itemClass);
    }
    static conditionallyAddInformation(item) {
        if (this.isWeapon(item)) {
            if (lodash_2.isUndefined(item.isBeltable))
                item.isBeltable = true;
            if (lodash_2.isUndefined(item.isSackable))
                item.isSackable = false;
            if (!item.maxDamage)
                item.maxDamage = item.baseDamage;
        }
        if (this.isArmor(item)) {
            if (lodash_2.isUndefined(item.isBeltable))
                item.isBeltable = false;
            if (lodash_2.isUndefined(item.isSackable))
                item.isSackable = false;
        }
        if (item.itemClass === 'Tunic') {
            item.isSackable = true;
        }
        if (item.type === 'Polearm') {
            item.isBeltable = false;
            item.twoHanded = true;
            item.attackRange = 1;
        }
        if (item.type === 'Twohanded' || item.secondaryType === 'Twohanded') {
            item.twoHanded = true;
        }
        if (lodash_2.includes(['Shortbow', 'Longbow'], item.itemClass)) {
            item.twoHanded = true;
        }
        if (lodash_2.includes(['Crossbow', 'Shortbow', 'Longbow'], item.itemClass)) {
            item.attackRange = 4;
        }
        if (item.itemClass === 'Shield') {
            if (!item.stats.accuracy)
                item.stats.accuracy = 1;
            item.baseDamage = 1;
        }
        if (item.itemClass === 'Bottle' || item.itemClass === 'Food') {
            item.ounces = item.ounces || 1;
        }
        item.type = lodash_2.capitalize(item.type);
        if (item.secondaryType)
            item.secondaryType = lodash_2.capitalize(item.secondaryType);
    }
    static validateItem(item) {
        let hasBad = false;
        if (!item.name) {
            console.error(`ERROR: ${JSON.stringify(item)} has no name!`);
            hasBad = true;
        }
        if (!item.desc) {
            console.error(`ERROR: ${item.name} has no description!`);
            hasBad = true;
        }
        if (!item.sprite) {
            console.error(`ERROR: ${item.name} has no sprite!`);
            hasBad = true;
        }
        if (!lodash_2.includes(item_1.ValidItemTypes, item.type)) {
            console.error(`ERROR: ${item.name} has an invalid item type!`);
            hasBad = true;
        }
        if (item.requirements && item.requirements.class) {
            const invalidClasses = lodash_1.reject(item.requirements.class, testClass => Classes[testClass]);
            if (invalidClasses.length > 0) {
                console.error(`ERROR: ${item.name} has invalid class requirements: ${invalidClasses.join(', ')}`);
                hasBad = true;
            }
        }
        if (item.stats) {
            const statsTest = new character_1.Stats();
            const invalidStats = lodash_1.difference(Object.keys(item.stats), Object.keys(statsTest));
            if (invalidStats.length > 0) {
                console.error(`ERROR: ${item.name} has invalid stats: ${invalidStats.join(', ')}`);
                hasBad = true;
            }
        }
        if (item.effect && !Effects[item.effect.name] && !item.effect.uses) {
            console.error(`ERROR: ${item.name} has an invalid effect: ${item.effect.name}`);
            hasBad = true;
        }
        if (hasBad) {
            throw new Error('Invalid item. Stopping.');
        }
        return true;
    }
}
ItemLoader.loadAllItems();
//# sourceMappingURL=items.js.map