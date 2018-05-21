
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Frostlands Townee' },
  { chance: 1, result: 'Frostlands Guard' }
];

const paths = [
  '30-W 1-N 30-E 1-S',
  '30-S 1-E 30-N 1-W'
];

export class FrostlandsTownRouteNE extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 3,
      maxCreatures: 7,
      spawnRadius: 1,
      randomWalkRadius: 0,
      leashRadius: 35,
      npcIds,
      paths
    });
  }

}
