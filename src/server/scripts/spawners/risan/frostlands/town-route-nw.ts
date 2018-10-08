
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Frostlands Townee' },
  { chance: 1, result: 'Frostlands Guard' }
];

const paths = [
  '10-W 15-N 20-W 20-E 15-S 10-E',
  '10-W 24-S 10-E 24-N',
  '30-S 1-W 30-N 1-E',
  '30-E 1-S 30-W 1-N'
];

export class FrostlandsTownRouteNW extends Spawner {

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
