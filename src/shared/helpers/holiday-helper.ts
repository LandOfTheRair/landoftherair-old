
import { some } from 'lodash';

import { Player } from '../models/player';

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

const holidayDescriptions = {
  Halloween: 'Go smash some zombies, take their brains, and go trick-or-treating!'
};

export class HolidayHelper {

  static isHoliday(hol: Holiday): boolean {
    return holidayChecker[hol]();
  }

  static isAnyHoliday(): boolean {
    return some(Object.keys(holidayChecker).map(hol => holidayChecker[hol]()));
  }

  static currentHoliday(): string {
    let holiday = '';

    // we do this in case we have sub-holidays, ie, new years is the last week of christmas (for example)
    Object.keys(holidayChecker).forEach(checkHoliday => {
      if(!holidayChecker[checkHoliday]()) return;
      holiday = checkHoliday;
    });

    return holiday;
  }

  static currentHolidayDescription(holiday: Holiday|string): string {
    return holidayDescriptions[holiday];
  }

  static tryGrantHolidayTokens(player: Player, amt: number): void {
    if(!HolidayHelper.isAnyHoliday()) return;

    player.earnCurrency(<Currency>HolidayHelper.currentHoliday().toLowerCase(), amt);
    player.sendClientMessage(`You also earned ${amt} holiday tokens!`);
  }
}


