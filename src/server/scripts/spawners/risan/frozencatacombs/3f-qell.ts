
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Catacombs Qell 3F'
];

export class CatacombsQell3FSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 60,
      initialSpawn: 2,
      maxCreatures: 3,
      spawnRadius: 1,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

}
