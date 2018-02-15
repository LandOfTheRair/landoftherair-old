
import * as NRP from 'node-redis-pubsub';

import { map, find, extend, clone } from 'lodash';
import { GameSettings } from './bonus-helper';

const redisUrl = process.env.REDIS_URL;

export class BonusArbiter {

  private redis: NRP;

  // TODO every festival bought extends the _duration_ (back up in lobby settings, decrement it every hour), not the intensity
  private bonusSyncData: GameSettings = {
    xpMult: 1, goldMult: 1, skillMult: 1, partyXPMult: 1,
    traitGainMult: 1, traitTimerMult: 1,
    numberOfRandomStatsForItems: 0,
    randomStatMaxValue: 0,
    randomStatChance: 0
  };

  public get allBonusData() {
    return clone(this.bonusSyncData);
  }

  constructor() {
    this.redis = new NRP({ url: redisUrl });

    this.initListeners();
  }

  private initListeners() {
    this.redis.on('bonus:requestsync', () => {
      this.syncSettings();
    });
  }

  private syncSettings() {
    this.redis.emit('bonus:sync', { bonus: this.bonusSyncData });
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

}
