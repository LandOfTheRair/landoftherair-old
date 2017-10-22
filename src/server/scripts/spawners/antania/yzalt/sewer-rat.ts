
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Yzalt Sewer Rat'
];

export class SewerRatSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 2,
      maxCreatures: 4,
      spawnRadius: 0,
      randomWalkRadius: 25,
      leashRadius: 45,
      npcIds
    });
  }

}
