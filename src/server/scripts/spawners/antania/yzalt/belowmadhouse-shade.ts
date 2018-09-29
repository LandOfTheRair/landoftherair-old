
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Ranata Shade'
];

export class YzaltBelowMadhouseShadeSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 0,
      initialSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 1,
      randomWalkRadius: 1,
      leashRadius: 50,
      shouldBeActive: true,
      canSlowDown: false,
      npcIds
    });
  }

}
