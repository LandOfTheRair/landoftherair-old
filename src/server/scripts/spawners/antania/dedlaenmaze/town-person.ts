
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Dedlaen Townee'
];

export class TowneeSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 2,
      maxCreatures: 5,
      spawnRadius: 3,
      randomWalkRadius: 7,
      leashRadius: 10,
      doInitialSpawnImmediately: true,
      npcIds
    });
  }

}
