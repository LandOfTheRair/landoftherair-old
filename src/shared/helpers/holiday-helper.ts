
import { some } from 'lodash';

import { Player } from '../models/player';

export enum Holiday {
  Halloween = 'Halloween',
  Thanksgiving = 'Thanksgiving'
}

export enum Currency {
  Gold = 'gold',
  Halloween = 'halloween',
  Thanksgiving = 'thanksgiving'
}

const holidayChecker = {

  // takes place in October, all month
  Halloween: () => {
    return new Date().getMonth() === 9;
  },

  // takes place in November, all month
  Thanksgiving: () => {
    return new Date().getMonth() === 10;
  }
};

const holidayDescriptions = {
  Halloween: 'Go smash some zombies, take their brains, and go trick-or-treating!',
  Thanksgiving: 'Help some pilgrims shoot some turkeys, test your shooting accuracy, and gather food for a feast!'
};

export class HolidayHelper {

  static isHoliday(hol: Holiday): boolean {
    if(!holidayChecker[hol]) return false;
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

    if(player.$$room.subscriptionHelper.isSubscribed(player)) amt *= 2;

    player.earnCurrency(<Currency>HolidayHelper.currentHoliday().toLowerCase(), amt);
    player.sendClientMessage(`You also earned ${amt} holiday tokens!`);
  }
}


