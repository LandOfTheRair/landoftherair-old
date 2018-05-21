
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Frostlands Townee' },
  { chance: 1, result: 'Frostlands Guard' }
];

export class FrostlandsTownGuardTowerSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 4,
      spawnRadius: 1,
      randomWalkRadius: 7,
      leashRadius: 12,
      npcIds
    });
  }

}
