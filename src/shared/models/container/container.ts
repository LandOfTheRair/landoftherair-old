
import { startCase, compact, findIndex, sample, isUndefined, isNumber } from 'lodash';

import { Item } from '../item';

export class Container {

  public size: number;
  protected autoFix = true;
  protected items: Item[] = [];

  public get allItems() {
    return this.items;
  }

  public get hasItems(): boolean {
    return this.items.length > 0;
  }

  constructor({ size }) {
    this.size = size;
  }

  initItems() {
    this.items = this.items.map(item => item ? new Item(item) : null);
  }

  isFull() {
    return this.items.length >= this.size;
  }

  fix() {
    if(!this.autoFix) return;
    this.items = compact(this.items);
  }

  addItem(item: Item, index?: number, extra?: any): string {
    const containerName = startCase(this.constructor.name).toLowerCase();
    if(!this.canAccept(item, index)) return `That item does not fit properly in that slot of your ${containerName}.`;
    if(this.isFull() && isUndefined(index)) return `Your ${containerName} is full.`;
    if(isNumber(index)) {
      if(this.items[index]) return 'There is already something there.';
      if(index < 0 || index > this.size) return 'Container does not match that size.';
      this.items[index] = item;
    } else {
      this.items.push(item);
    }
  }

  getItemFromSlot(slot: number): Item {
    return this.items[slot];
  }

  takeItemFromSlot(slot: number, amt?: number): Item {
    const item = this.items[slot];
    if(!item) return null;

    this.items[slot] = null;
    this.fix();
    return item;
  }

  randomItem(): Item {
    return sample(this.items);
  }

  takeItem(item: Item): Item {
    const index = findIndex(this.items, x => x === item);
    return this.takeItemFromSlot(index);
  }

  takeItemFromSlots(slots: number[]): Item[] {
    return slots.sort((x, y) => x - y).reverse().map(index => this.takeItemFromSlot(index));
  }

  canAccept(item: Item, index?: number): boolean {
    if(!item) return false;
    return item.itemClass !== 'Corpse' && item.itemClass !== 'Coin';
  }
}
