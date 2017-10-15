
import { clone, extend } from 'lodash';

import { DB } from '../database';

export class GameSettings {
  xpMult: number;
  skillMult: number;
  goldMult: number;
  traitTimerMult: number;
  traitGainMult: number;
  numberOfRandomStatsForItems: number;
  randomStatMaxValue: number;
  randomStatChance: number;
}

export const BASE_SETTINGS: GameSettings = {
  xpMult: 1,
  skillMult: 1,
  goldMult: 1,
  traitTimerMult: 1,
  traitGainMult: 1,
  numberOfRandomStatsForItems: 0,
  randomStatMaxValue: 0,
  randomStatChance: 0
};

export class SettingsHelper {

  static async loadSettings(region: string, map: string): Promise<GameSettings> {
    const mapSettings = await DB.$gameSettings.findOne({ region, map }) || {};
    return extend(clone(BASE_SETTINGS), mapSettings);
  }

  static async saveMapSettings(region: string, map: string, settings: GameSettings): Promise<any> {
    return DB.$gameSettings.update(
      { region, map },
      { $set: settings },
      { upsert: true }
    );
  }

  static async resetMapSettings(region: string, map: string): Promise<any> {
    return DB.$gameSettings.remove(
      { region, map },
      { multi: true }
    );
  }

  static isSettingValid(key: string): boolean {
    return BASE_SETTINGS.hasOwnProperty(key);
  }

}
