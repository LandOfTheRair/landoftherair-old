
import { extend, clone, includes } from 'lodash';

import { Item } from '../../item';
import { Container } from '../container';

export class SpellforgingContainer extends Container {

  protected autoFix = false;

  private dust = {
    enos: 0,
    owts: 0
  };

  get dustValues() {
    return clone(this.dust);
  }

  constructor(opts) {
    super({ size: 3 });
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

  gainDust(dustType: string, number = 1) {
    this.dust[dustType] += number;
  }

  clearReagents() {
    this.items[0] = null;
    this.items[1] = null;
  }

  clearIngredient() {
    this.items[1] = null;
  }

  canAccept(item, index?: number) {
    if(index < 0) return false;
    if(index >= 2) return false;
    if(index === 1 && !includes(item.name, 'Rune Scroll') && !includes(item.name, 'Enchanting Brick')) return false;
    return super.canAccept(item);
  }
}
