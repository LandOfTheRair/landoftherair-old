
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 1,  result: 'Dedlaen Skeleton Knight' },
  { chance: 10, result: 'Dedlaen Skeleton' }
];

export class SkeletonSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 5,
      initialSpawn: 5,
      maxCreatures: 45,
      spawnRadius: 15,
      randomWalkRadius: 35,
      leashRadius: 45,
      npcIds
    });
  }

}
