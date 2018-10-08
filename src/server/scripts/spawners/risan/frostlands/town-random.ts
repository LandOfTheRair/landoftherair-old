
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Frostlands Townee' },
  { chance: 1, result: 'Frostlands Guard' },
];

export class FrostlandsTownRandomSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 3,
      maxCreatures: 7,
      spawnRadius: 2,
      randomWalkRadius: 20,
      leashRadius: 35,
      doInitialSpawnImmediately: true,
      npcIds
    });
  }

}
