
import * as NRP from 'node-redis-pubsub';
import * as scheduler from 'node-schedule';

import { map, find, extend, clone } from 'lodash';
import { GameSettings } from './bonus-helper';
import { Lobby } from '../rooms/Lobby';

const redisUrl = process.env.REDIS_URL;

export class BonusArbiter {

  private redis: NRP;

  private bonusSyncData: GameSettings = {
    xpMult: 1, goldMult: 1, skillMult: 1, partyXPMult: 1,
    traitGainMult: 1, traitTimerMult: 1,
    numberOfRandomStatsForItems: 0,
    randomStatMaxValue: 0,
    randomStatChance: 0
  };

  private boughtBonusHoursRemaining = {
    xpMult: 0,
    goldMult: 0,
    skillMult: 0,
    traitGainMult: 0
  };

  private bonusTimers = {
    xpMult: null,
    goldMult: null,
    skillMult: null,
    traitGainMult: null
  };

  public get allBonusData() {
    return clone(this.bonusSyncData);
  }

  public get boughtBonusHours() {
    return clone(this.boughtBonusHoursRemaining);
  }

  constructor(private lobby: Lobby) {
    this.redis = new NRP({ url: redisUrl });

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

        this.lobby.saveSettings();

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

  public manuallyUpdateBonusHours(hours) {
    Object.keys(hours).forEach(settingsKey => {
      if(!this.boughtBonusHoursRemaining.hasOwnProperty(settingsKey)) {
        delete hours[settingsKey];
        return;
      }

      if(this.boughtBonusHoursRemaining[settingsKey] === hours[settingsKey]) return;

      this.boughtBonusHoursRemaining[settingsKey] += hours[settingsKey];
    });

    this.initTimers();
    this.syncSettings();

    return hours;
  }

}
