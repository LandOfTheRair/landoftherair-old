
import { extend, isNumber } from 'lodash';

import { Container } from './container';
import { MaterialSlotInfo, ReverseValidItems, ValidMaterialItems } from '../../helpers/material-storage-layout';
import { Item } from '../item';

export class MaterialLocker extends Container {
  protected autoFix = false;

  public username: string;

  constructor(opts) {
    super({ size: Object.keys(ReverseValidItems).length });
    extend(this, opts);
    this.initItems();
  }

  addItem(item: Item, index?: number, extra?: any): string {
    if(!extra) return 'You cannot add things to material storage like that.';
    if(!this.canAccept(item)) return 'That item is not a valid material.';

    const { maxSize } = extra;

    const desiredIndex = ValidMaterialItems[item.name];
    const slotInfo = MaterialSlotInfo[desiredIndex];

    // put a new item in material storage
    if(!this.items[desiredIndex]) {

      // if we have a large item that won't fit in material storage, shrink it
      if(item.ounces > 0 && item.ounces > maxSize) {
        const copy = new Item(item);
        copy.ounces = maxSize;
        item.ounces -= copy.ounces;
        this.items[desiredIndex] = copy;
        copy.sprite = slotInfo.sprite;

        return 'Not all of the items fit in your material storage.';

      // if it fits, let it in
      } else {
        this.items[desiredIndex] = item;
        if(!item.ounces) item.ounces = 1;
        item.sprite = slotInfo.sprite;
        return;
      }
    }

    const existingItem = this.items[desiredIndex];
    const baseAddOunces = item.ounces || 1;
    const totalAddOunces = baseAddOunces + existingItem.ounces > maxSize ? maxSize - existingItem.ounces : baseAddOunces;

    existingItem.ounces += totalAddOunces;

    if(totalAddOunces !== baseAddOunces) {
      if(item.ounces > 0) item.ounces -= totalAddOunces;
      return 'Not all of the items fit in your material storage.';
    }
  }

  takeItemFromSlot(slot: number, amt = 1): Item {
    const item = this.items[slot];
    if(!item) return null;

    amt = Math.floor(Math.max(amt, 1));
    if(isNaN(amt)) return null;

    if(amt > item.ounces) {
      this.items[slot] = null;
    } else {
      const cloneItem = new Item(item, { doRegenerate: true });
      delete cloneItem.ounces;

      // if it comes out in ounces, just make one big cluster
      if(MaterialSlotInfo[slot].withdrawInOunces) {
        cloneItem.ounces = amt;
        item.ounces -= amt;

      // otherwise, it comes out as one
      } else {
        item.ounces -= 1;
      }

      if(item.ounces <= 0) {
        this.items[slot] = null;
      }

      return cloneItem;
    }

    return item;
  }

  canAccept(item: Item): boolean {
    if(!item) return false;
    return isNumber(ValidMaterialItems[item.name]);
  }

}
