
import { DB } from '../database';
import { Item } from '../../models/item';

export class ItemCreator {

  static getItemByName(name: string): Promise<Item> {
    return DB.$items.findOne({ name }).then(item => {
      if(!item) throw new Error(`Item ${name} does not exist.`);
      return new Item(item);
    });
  }

}
