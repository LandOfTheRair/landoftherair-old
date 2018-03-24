
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 1, result: 'Dedlaen Skeleton Knight' },
  { chance: 5, result: 'Dedlaen Skeleton' }
];

export class SkeletonRoomSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 10,
      initialSpawn: 4,
      maxCreatures: 10,
      spawnRadius: 2,
      randomWalkRadius: 10,
      leashRadius: 20,
      npcIds
    });
  }

}
