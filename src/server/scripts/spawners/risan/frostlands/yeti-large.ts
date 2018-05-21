
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Frostlands Strong Yeti' },
  { chance: 1, result: 'Frostlands Frostgolem' }
];

export class BigYetiCaveSpawnerSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 7,
      initialSpawn: 2,
      maxCreatures: 4,
      spawnRadius: 5,
      randomWalkRadius: 7,
      leashRadius: 12,
      npcIds
    });
  }

}
