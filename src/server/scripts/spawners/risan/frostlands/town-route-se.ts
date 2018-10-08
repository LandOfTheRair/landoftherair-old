
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Frostlands Townee' },
  { chance: 1, result: 'Frostlands Guard' }
];

const paths = [
  '30-W 1-N 30-E 1-S',
  '15-E 15-N 1-W 15-S 14-W',
  '15-E 7-S 7-N 15-W'
];

export class FrostlandsTownRouteSE extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 3,
      maxCreatures: 7,
      spawnRadius: 1,
      randomWalkRadius: 0,
      leashRadius: 35,
      doInitialSpawnImmediately: true,
      npcIds,
      paths
    });
  }

}
