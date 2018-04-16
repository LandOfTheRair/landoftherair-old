
import { Spawner } from '../../../base/Spawner';
import { extend } from 'lodash';

export class ResourceSpawner extends Spawner {

  constructor(room, opts, properties) {

    const spawnerProps: any = extend({
      respawnRate: 1800,
      initialSpawn: 1,
      maxSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 0,
      shouldSerialize: true,
      alwaysSpawn: true,
      requireDeadToRespawn: true,
      canSlowDown: false,
      eliteTickCap: 0,
      npcAISettings: ['resource']
    }, properties);

    spawnerProps.npcIds = properties.resourceIds || [];

    super(room, opts, spawnerProps);
  }

}
