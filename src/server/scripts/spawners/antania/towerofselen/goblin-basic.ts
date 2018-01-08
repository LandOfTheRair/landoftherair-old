
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Goblin'
];

export class TowerGoblinBasicSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 2,
      maxCreatures: 5,
      spawnRadius: 1,
      randomWalkRadius: 10,
      leashRadius: 20,
      npcIds
    });
  }

}
