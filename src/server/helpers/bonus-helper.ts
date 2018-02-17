
import { clone, extend } from 'lodash';

import { GameWorld } from '../rooms/GameWorld';
import { Redis } from '../redis';

export interface GameSettings {
  xpMult: number;
  skillMult: number;
  goldMult: number;
  traitTimerMult: number;
  traitGainMult: number;
  partyXPMult: number;
  numberOfRandomStatsForItems: number;
  randomStatMaxValue: number;
  randomStatChance: number;
}

const BASE_SETTINGS: GameSettings = {
  xpMult: 1,
  skillMult: 1,
  goldMult: 1,
  traitTimerMult: 1,
  traitGainMult: 1,
  partyXPMult: 1,
  numberOfRandomStatsForItems: 0,
  randomStatMaxValue: 0,
  randomStatChance: 0
};

export class BonusHelper {

  public settings: GameSettings = BASE_SETTINGS;

  private get redis() {
    return Redis.client;
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
