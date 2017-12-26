
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Yzalt Sewer Rat'
];

export class DungeonSewerRatSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 3,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 25,
      leashRadius: 45,
      npcIds
    });
  }

}
