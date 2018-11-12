
import { extend, clone, includes } from 'lodash';

import { Container } from '../container';
import { ISpellforgingContainer } from '../../../interfaces/container';
import { IItem } from '../../../interfaces/item';

export class SpellforgingContainer extends Container implements ISpellforgingContainer {

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

  get modifyItem(): IItem {
    return this.items[0];
  }

  get reagent(): IItem {
    return this.items[1];
  }

  get result(): IItem {
    return this.items[2];
  }

  set result(item: IItem) {
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
    if(index === 1
    && !includes(item.name, 'Rune Scroll')
    && !includes(item.name, 'Enchanting Brick')
    && !includes(item.name, 'Runewritten Scroll')) return false;
    return super.canAccept(item);
  }
}
