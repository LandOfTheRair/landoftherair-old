
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Catacombs Mummy 2F'
];

export class CatacombsMummy2FSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 2,
      maxCreatures: 3,
      spawnRadius: 1,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

}
