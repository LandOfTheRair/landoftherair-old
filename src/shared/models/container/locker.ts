
import { extend } from 'lodash';

import { Container } from './container';

export class Locker extends Container {
  public charSlot: number;
  public username: string;
  public regionId: string;
  public lockerId: string;

  public lockerName: string;

  constructor(opts) {
    super({ size: 15 });
    extend(this, opts);
    this.initItems();
  }
}
