
import { Spawner } from '../../../base/Spawner';
import { extend } from 'lodash';

export class LairSpawner extends Spawner {

  constructor(room, opts, properties) {

    const spawnerProps: any = extend({
      respawnRate: 3600,
      initialSpawn: 1,
      maxSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 2,
      leashRadius: 10,
      shouldSerialize: true,
      alwaysSpawn: true,
      requireDeadToRespawn: true,
      shouldStrip: true,
      stripOnSpawner: true
    }, properties);

    spawnerProps.npcIds = [properties.lairName];

    super(room, opts, spawnerProps);
  }

}
