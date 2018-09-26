
import { extend } from 'lodash';

import { GameWorld } from '../../rooms/GameWorld';

export interface GameSettings {
  xpMult: number;
  skillMult: number;
  goldMult: number;
  itemFindMult: number;
  partyXPMult: number;
  numberOfRandomStatsForItems: number;
  randomStatMaxValue: number;
  randomStatChance: number;
}

const BASE_SETTINGS: GameSettings = {
  xpMult: 1,
  skillMult: 1,
  goldMult: 1,
  itemFindMult: 1,
  partyXPMult: 1,
  numberOfRandomStatsForItems: 0,
  randomStatMaxValue: 0,
  randomStatChance: 0
};

export class BonusHelper {

  public settings: GameSettings = BASE_SETTINGS;

  private get redis() {
    return this.room.redisClient;
  }

  constructor(private room: GameWorld) {

    this.initListeners();
  }

  private initListeners() {

    this.redis.on('bonus:sync', ({ bonus }) => {
      extend(this.settings, bonus);
    });

    this.redis.emit('bonus:requestsync', {});
  }

}
