
import { Spawner } from '../../../base/Spawner';

import { extend } from 'lodash';

export class EmptySpawner extends Spawner {

  constructor(room, opts, properties) {

    const spawnerProps: any = extend({
      respawnRate: 0,
      initialSpawn: 0,
      maxSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 7,
      leashRadius: 12,
      shouldSerialize: true,
      alwaysSpawn: true,
      requireDeadToRespawn: true,
      shouldStrip: true,
      stripOnSpawner: true,
      canSlowDown: false,
      eliteTickCap: 0,
      npcIds: []
    }, properties);

    super(room, opts, spawnerProps);
  }

}
