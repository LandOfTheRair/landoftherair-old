
import { extend } from 'lodash';

import { Container } from './container';

export class Pouch extends Container {
  constructor(opts) {
    super({ size: opts ? opts.size : 0 });
    extend(this, opts);
    this.initItems();
  }

  canAccept(item) {
    return item.isSackable && super.canAccept(item);
  }

  resetItems() {
    this.items = [];
  }
}
