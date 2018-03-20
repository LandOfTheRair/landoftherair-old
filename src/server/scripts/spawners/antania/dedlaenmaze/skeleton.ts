
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Dedlaen Skeleton'
];

export class SkeletonSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 3,
      maxCreatures: 7,
      spawnRadius: 0,
      randomWalkRadius: 45,
      leashRadius: 65,
      npcIds
    });
  }

}
