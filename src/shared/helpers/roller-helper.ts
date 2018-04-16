
import { random } from 'lodash';

export class RollerHelper {
  static XInOneHundred(myDesiredRollMax: number): boolean {
    return random(1, 100) <= myDesiredRollMax;
  }

  static OneInX(x: number): boolean {
    return random(1, x) === 1;
  }
}
