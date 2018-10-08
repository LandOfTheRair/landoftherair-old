
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Frostlands Slave'
];

export class FrostlandsTownCastleSlaveSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 1,
      randomWalkRadius: 7,
      leashRadius: 12,
      doInitialSpawnImmediately: true,
      npcIds
    });
  }

}
