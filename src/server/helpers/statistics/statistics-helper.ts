

import { DB } from '../../database';
import { Player } from '../../../shared/models/player';
import { Statistics } from '../../../shared/models/statistics';

export class StatisticsHelper {

  async saveStatistics(player: Player): Promise<any> {

    if(!player.$$statistics) return false;

    player.$$statistics.importFrom(player);

    return DB.$characterStatistics.update(
      { username: player.username, charSlot: player.charSlot },
      { $set: { statistics: player.$$statistics } },
      { upsert: true }
    );
  }

  async loadStatistics(player: Player): Promise<Statistics> {
    const statsData = await DB.$characterStatistics.findOne({
      username: player.username,
      charSlot: player.charSlot
    });

    const stats = new Statistics(statsData ? statsData.statistics : {});

    return stats;
  }
}
