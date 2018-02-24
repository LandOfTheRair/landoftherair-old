
import { extend, clone, includes } from 'lodash';

import { Item, ArmorClasses } from '../../item';
import { Container } from '../container';

export class MetalworkingContainer extends Container {

  protected autoFix = false;

  private ore = {
    copper: 0,
    silver: 0,
    gold: 0
  };

  get oreValues() {
    return clone(this.ore);
  }

  constructor(opts) {
    super({ size: 6 });
    extend(this, opts);
    this.initItems();
  }

  get modifyItem(): Item {
    return this.items[0];
  }

  get reagent(): Item {
    return this.items[1];
  }

  get result(): Item {
    return this.items[2];
  }

  set result(item: Item) {
    this.items[2] = item;
  }

  gainOre(oreType: string, number = 1) {
    this.ore[oreType] += number;
  }

  clearCraft() {
    this.items[0] = null;
    this.items[1] = null;
  }

  clearUpgrade() {
    this.items[3] = null;
    this.items[4] = null;
  }

  clearCraftIngredient() {
    this.items[1] = null;
  }

  clearUpgradeIngredient() {
    this.items[4] = null;
  }

  canAccept(item, index?: number) {
    if(index < 0 || index === 2 || index >= 5) return false;

    // index === 0 = main slot armor (tunic or breastplate)
    if(index === 0 && item.itemClass !== 'Tunic' && item.itemClass !== 'Breastplate') return false;

    // index === 1 = upgrade component (scale, etc)
    if(index === 1 && item.itemClass !== 'Scale') return false;

    // index === 2 = mold output

    // index === 3 = main slot armor (any)
    if(index === 3 && !includes(ArmorClasses, item.itemClass)) return false;

    // index === 4 = upgrade component (ingot or fur)
    if(index === 4 && !includes(item.name, 'Ingot') && item.itemClass !== 'Fur') return false;

    // index === 5 = upgrade output
    return super.canAccept(item);
  }
}
