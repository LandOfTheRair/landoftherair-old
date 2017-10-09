
import { DB } from '../database';
import { Item } from '../../models/item';

export class ItemCreator {

  static getItemByName(name: string): Promise<Item> {
    return DB.$items.findOne({ name }).then(item => {
      if(!item) throw new Error(`Item ${name} does not exist.`);
      return new Item(item);
    });
  }

  static searchItems(name: string): Promise<Item> {
    const regex = new RegExp(`.*${name}.*`, 'i');
    return DB.$items.find({ name: regex }).toArray();
  }

  static async getGold(value: number): Promise<Item> {
    const item = await this.getItemByName('Gold Coin');
    item.value = value;
    return item;
  }
}
