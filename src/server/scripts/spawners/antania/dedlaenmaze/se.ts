
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Dedlaen Spider' },
  { chance: 5, result: 'Dedlaen Leech' },
  { chance: 1, result: 'Dedlaen Vampire Bat' },
  { chance: 1, result: 'Dedlaen Skeleton' }
];

export class SESpawner extends Spawner {

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
