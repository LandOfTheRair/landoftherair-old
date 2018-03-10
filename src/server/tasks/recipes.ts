
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });

import { DB } from '../database';

import * as YAML from 'yamljs';
import * as recurse from 'recursive-readdir';
import * as path from 'path';

import { flatten } from 'lodash';

class RecipeLoader {

  static async loadAllRecipes() {
    await DB.init();

    recurse(`${__dirname}/../data/recipes`).then(async files => {
      const filePromises = files.map(file => {
        const fileName = path.basename(path.dirname(file));
        const itemsOfType = YAML.load(file);

        const promises = itemsOfType.map(itemData => {

          itemData.recipeType = fileName;

          return new Promise((resolve, reject) => {
            RecipeLoader.addItemData(itemData);
            if(!RecipeLoader.validateItem(itemData)) return reject(new Error(`${itemData.name} failed validation.`));
            return resolve(itemData);
          });

        });

        return promises;
      });

      try {
        const allItemData = await Promise.all(flatten(filePromises));

        console.log('Validated all recipes.');

        await DB.$recipes.remove({}, { multi: true });

        console.log('Removed old recipes.');

        const allItemDataPromises = allItemData.map((itemData: any) => {
          return DB.$recipes.insert(itemData);
        });

        await Promise.all(flatten(allItemDataPromises));

        console.log('Inserted all recipes.');

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

  static addItemData(recipe): void {
    if(!recipe.requiredSkill) recipe.requiredSkill = 0;
  }

  static validateItem(recipe): boolean {
    let hasBad = false;

    if(!recipe.item) {
      console.error(`ERROR: ${JSON.stringify(recipe)} has no item crafted!`);
      hasBad = true;
    }

    if(recipe.skillGained <= 0) {
      console.error(`ERROR: ${recipe.name} has an invalid amount of skill gain!`);
      hasBad = true;
    }

    if(recipe.maxSkillForGains <= 0) {
      console.error(`ERROR: ${recipe.name} has an invalid max skill gain level!`);
      hasBad = true;
    }

    if(recipe.xpGained <= 0) {
      console.error(`ERROR: ${recipe.name} has an invalid xp gain!`);
      hasBad = true;
    }

    if(!recipe.ingredients || recipe.ingredients.length === 0) {
      console.error(`ERROR: ${recipe.name} does not have any ingredients!`);
      hasBad = true;
    }

    if(hasBad) {
      throw new Error('Invalid item. Stopping.');
    }

    return true;
  }

}

RecipeLoader.loadAllRecipes();
