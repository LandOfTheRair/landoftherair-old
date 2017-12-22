
import { extend, compact, findIndex, sample } from 'lodash';

import { Item } from '../item';

export class Container {

  public size: number;

  private items: Item[] = [];

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
    this.items = this.items.map(item => new Item(item));
  }

  isFull() {
    return this.items.length >= this.size;
  }

  fix() {
    this.items = compact(this.items);
  }

  addItem(item: Item): string {
    if(!this.canAccept(item)) return `That item does not fit properly in your ${this.constructor.name.toLowerCase()}.`;
    if(this.isFull()) return `Your ${this.constructor.name.toLowerCase()} is full.`;
    this.items.push(item);
  }

  getItemFromSlot(slot: number): Item {
    return this.items[slot];
  }

  takeItemFromSlot(slot: number): Item {
    const item = this.items[slot];
    if(!item) return null;

    this.items[slot] = null;
    this.fix();
    return item;
  }

  randomItem() {
    return sample(this.items);
  }

  takeItem(item: Item) {
    const index = findIndex(this.items, x => x === item);
    this.takeItemFromSlot(index);
  }

  takeItemFromSlots(slots: number[]) {
    slots.reverse().forEach(index => this.takeItemFromSlot(index));
  }

  canAccept(item: Item) {
    return item.itemClass !== 'Corpse' && item.itemClass !== 'Coin';
  }
}
