
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 1,  result: 'Dedlaen Skeleton Knight' },
  { chance: 10, result: 'Dedlaen Skeleton' }
];

export class SkeletonSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 3,
      initialSpawn: 1,
      maxCreatures: 20,
      spawnRadius: 10,
      randomWalkRadius: 15,
      leashRadius: 20,
      npcIds
    });
  }

}
