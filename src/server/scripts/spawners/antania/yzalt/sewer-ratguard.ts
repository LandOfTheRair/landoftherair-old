
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Yzalt Sewer RatGuard'
];

export class SewerRatGuardSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 3,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 7,
      leashRadius: 20,
      npcIds
    });
  }

}
