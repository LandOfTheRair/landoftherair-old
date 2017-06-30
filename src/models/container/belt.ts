
import { extend, compact } from 'lodash';

import { Item } from '../item';
import { Container } from './container';

export class Belt extends Container {
  constructor(opts) {
    super({ size: opts.size || 5 });
    extend(this, opts);
    this.initItems();
  }

  canAccept(item) {
    return item.isBeltable && super.canAccept(item);
  }
}
