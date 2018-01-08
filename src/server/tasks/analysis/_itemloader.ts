
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });

import { DB } from '../../database';

export class ItemLoader {

  static WEAPON_TYPES: string[] = [
    'Axe', 'Broadsword', 'Claws', 'Club', 'Crossbow', 'Dagger', 'Gloves', 'Greataxe', 'Greatmace', 'Greatsword',
    'Halberd', 'Hammer', 'Longbow', 'Longsword', 'Mace', 'Shield', 'Shortbow', 'Shortsword',
    'Spear', 'Staff', 'Wand'
  ];

  static ARMOR_TYPES: string[] = [
    'Amulet', 'Boots', 'Bracers', 'Breastplate', 'Claws', 'Cloak', 'Earring', 'Fur', 'Gloves', 'Helm',
    'Ring', 'Robe', 'Sash', 'Shield', 'Tunic'
  ];

  static OTHER_TYPES: string[] = [
    'Book', 'Bottle', 'Coin', 'Corpse', 'Flower', 'Food', 'Gem', 'Key', 'Rock', 'Scroll', 'Skull', 'Trap', 'Twig'
  ];

  static async loadAllItems(itemClasses: string[] = []) {
    await DB.init();

    return DB.$items.find({ sprite: { $ne: -1 }, itemClass: { $in: itemClasses } }).toArray();
  }
}
