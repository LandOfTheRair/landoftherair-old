
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Hobgoblin'
];

export class TowerHoboblinSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 60,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 1,
      randomWalkRadius: 10,
      leashRadius: 20,
      npcIds
    });
  }

}
