
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Dedlaen Spider' },
  { chance: 1, result: 'Dedlaen Vampire Bat' },
  { chance: 1, result: 'Dedlaen Skeleton' }
];

export class SESpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 5,
      initialSpawn: 3,
      maxCreatures: 10,
      spawnRadius: 10,
      randomWalkRadius: 15,
      leashRadius: 20,
      npcIds
    });
  }

}
