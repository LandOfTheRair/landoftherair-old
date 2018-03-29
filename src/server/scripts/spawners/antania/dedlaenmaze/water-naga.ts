
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Dedlaen Water Naga'
];

export class WaterNagaSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 2,
      maxCreatures: 5,
      spawnRadius: 2,
      randomWalkRadius: 10,
      leashRadius: 15,
      npcIds
    });
  }

}
