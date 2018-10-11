
import { random } from 'lodash';
import * as dice from 'dice.js';

export class RollerHelper {
  static XInY(myDesiredRollMax: number, myDesiredCap: number): boolean {
    return random(1, myDesiredCap) <= myDesiredRollMax;
  }

  static XInOneHundred(myDesiredRollMax: number): boolean {
    return RollerHelper.XInY(myDesiredRollMax, 100);
  }

  static OneInX(x: number): boolean {
    return random(1, x) === 1;
  }

  static uniformRoll(x: number, y: number): number {
    return random(x * y) + x;
  }

  static diceRoll(rolls: number, sides: number, minimum?: number): number {
    return +dice.roll(`${rolls}d${sides}${minimum ? '..' + minimum : ''}`);
  }
}
