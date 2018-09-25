
import { some } from 'lodash';

import { Player } from '../../../shared/models/player';

export enum Holiday {
  Halloween = 'Halloween'
}

export enum Currency {
  Gold = 'gold',
  Halloween = 'halloween'
}

const holidayChecker = {

  // takes place in October, all month
  Halloween: () => {
    return new Date().getMonth() === 8;
  }
};

export class HolidayHelper {

  static isHoliday(hol: Holiday): boolean {
    return holidayChecker[hol]();
  }

  static isAnyHoliday(): boolean {
    return some(Object.keys(holidayChecker).map(hol => holidayChecker[hol]()));
  }

  static tryGrantHolidayTokens(player: Player, amt: number): void {
    if(!HolidayHelper.isAnyHoliday()) return;

    player.sendClientMessage(`You also earned ${amt} holiday tokens!`);
  }
}


