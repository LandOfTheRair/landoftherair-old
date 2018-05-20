
import * as scheduler from 'node-schedule';

import { clone } from 'lodash';
import { GameSettings } from './bonus-helper';
import { Lobby } from '../../rooms/Lobby';

export class BonusArbiter {

  private bonusSyncData: GameSettings = {
    xpMult: 1, goldMult: 1, skillMult: 1, partyXPMult: 1,
    numberOfRandomStatsForItems: 0,
    randomStatMaxValue: 0,
    randomStatChance: 0
  };

  private boughtBonusHoursRemaining = {
    xpMult: 0,
    goldMult: 0,
    skillMult: 0
  };

  private bonusTimers = {
    xpMult: null,
    goldMult: null,
    skillMult: null
  };

  public get allBonusData() {
    return clone(this.bonusSyncData);
  }

  public get boughtBonusHours() {
    return clone(this.boughtBonusHoursRemaining);
  }

  private get redis() {
    return this.room.redisClient;
  }

  constructor(private room: Lobby) {
    this.initListeners();
    this.initTimers();
  }

  private initListeners() {
    this.redis.on('bonus:requestsync', () => {
      this.syncSettings();
    });
  }

  private initTimers() {
    Object.keys(this.boughtBonusHoursRemaining).forEach(key => {
      if(this.boughtBonusHoursRemaining[key] <= 0 || this.bonusTimers[key]) return;

      const rule = new scheduler.RecurrenceRule();
      rule.minute = new Date().getMinutes();

      this.bonusTimers[key] = scheduler.scheduleJob(rule, () => {
        this.boughtBonusHoursRemaining[key]--;

        this.room.saveSettings();

        if(this.boughtBonusHoursRemaining[key] <= 0) {
          this.boughtBonusHoursRemaining[key] = 0;
          this.bonusTimers[key].cancel();
          this.bonusTimers[key] = null;
        }
      });
    });
  }

  private syncSettings() {
    const allSettings = this.allBonusData;

    // +1 if there's a festival going on
    Object.keys(this.boughtBonusHoursRemaining).forEach(key => {
      if(this.boughtBonusHoursRemaining[key] <= 0) return;
      allSettings[key] += 1;
    });

    this.redis.emit('bonus:sync', { bonus: allSettings });
  }

  public manuallyUpdateBonusSettings(settings) {
    Object.keys(settings).forEach(settingsKey => {
      if(!this.bonusSyncData.hasOwnProperty(settingsKey)) {
        delete settings[settingsKey];
        return;
      }

      if(this.bonusSyncData[settingsKey] === settings[settingsKey]) return;

      this.bonusSyncData[settingsKey] = settings[settingsKey];
    });

    this.syncSettings();

    return settings;
  }

  public manuallyUpdateBonusHours(hours, forceAdd?: boolean) {
    Object.keys(hours).forEach(settingsKey => {
      if(!this.boughtBonusHoursRemaining.hasOwnProperty(settingsKey)) {
        delete hours[settingsKey];
        return;
      }

      if(!forceAdd && this.boughtBonusHoursRemaining[settingsKey] === hours[settingsKey]) return;

      this.boughtBonusHoursRemaining[settingsKey] += hours[settingsKey];
    });

    this.initTimers();
    this.syncSettings();

    return hours;
  }

}
