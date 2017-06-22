
import { extend, compact } from 'lodash';

import { Item } from './item';

export class Locker {
  public charSlot: number;
  public username: string;
  public regionId: string;
  public lockerId: string;

  public lockerName: string;

  public items: Item[] = [];

  constructor(opts) {
    extend(this, opts);

    this.initItems();
  }

  initItems() {
    this.items = this.items.map(item => new Item(item));
  }

  isFull() {
    return this.items.length >= 15;
  }

  fixLocker() {
    this.items = compact(this.items);
  }

  putItemInLocker(item: Item) {
    this.items.push(item);
  }

  takeItemFromLocker(slot: number): Item {
    const item = this.items[slot];
    this.items[slot] = null;
    this.fixLocker();
    return item;
  }

  canAccept(item: Item) {
    return item.itemClass !== 'Corpse' && item.itemClass !== 'Coin';
  }
}
