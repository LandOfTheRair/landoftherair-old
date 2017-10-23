
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Crazed Mummy'
];

export class CrazedMummySpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 3,
      maxCreatures: 5,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 35,
      npcIds
    });
  }

}
