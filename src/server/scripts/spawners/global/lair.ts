
import { Spawner } from '../../../base/spawner';
import { extend } from 'lodash';

export class LairSpawner extends Spawner {

  constructor(room, opts, properties) {

    const spawnerProps = extend({
      respawnRate: 7200,
      initialSpawn: 1,
      maxSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 2,
      leashRadius: 10,
      shouldSerialize: true
    }, properties);

    spawnerProps.npcIds = [properties.lairName];

    super(room, opts, spawnerProps);
  }

}
