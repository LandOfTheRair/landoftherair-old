
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Risan Dryad'
];

export class DryadSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 7,
      randomWalkRadius: 12,
      leashRadius: 18,
      npcIds
    });
  }

}
