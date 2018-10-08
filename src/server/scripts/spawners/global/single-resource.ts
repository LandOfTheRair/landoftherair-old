
import { Spawner } from '../../../base/Spawner';
import { extend } from 'lodash';

export class SingleResourceSpawner extends Spawner {

  constructor(room, opts, properties) {

    const spawnerProps: any = extend({
      respawnRate: 1800,
      initialSpawn: 1,
      maxSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 0,
      shouldSerialize: true,
      alwaysSpawn: true,
      requireDeadToRespawn: true,
      canSlowDown: false,
      eliteTickCap: 0,
      npcAISettings: ['resource'],
      doInitialSpawnImmediately: true
    }, properties);

    spawnerProps.npcIds = [properties.resourceName];

    super(room, opts, spawnerProps);
  }

}
