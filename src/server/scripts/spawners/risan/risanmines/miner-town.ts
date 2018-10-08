
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Risan Miner'
];

export class MinerTownSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 10,
      initialSpawn: 5,
      maxCreatures: 10,
      spawnRadius: 7,
      randomWalkRadius: 12,
      leashRadius: 18,
      doInitialSpawnImmediately: true,
      npcIds
    });
  }

}
