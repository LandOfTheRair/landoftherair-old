
import { Spawner } from '../../../base/Spawner';

const npcIds = [
  'Rylt Townee'
];

export class TestSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 10,
      maxCreatures: 10,
      spawnRadius: 1,
      randomWalkRadius: 25,
      leashRadius: 30,
      eliteTickCap: 2,
      npcIds
    });
  }

}
