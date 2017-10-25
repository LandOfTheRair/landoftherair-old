
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5,  result: 'Steffen Townee' },
  { chance: 1,  result: 'Steffen Child' }
];

export class SteffenTownSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 2,
      maxCreatures: 7,
      spawnRadius: 0,
      randomWalkRadius: 35,
      leashRadius: 45,
      npcIds
    });
  }

}
