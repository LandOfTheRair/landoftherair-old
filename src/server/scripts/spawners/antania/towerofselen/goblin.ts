
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Goblin',
  'Tower Goblin Thief'
];

export class TowerGoblinSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 50,
      initialSpawn: 2,
      maxCreatures: 5,
      spawnRadius: 1,
      randomWalkRadius: 15,
      leashRadius: 20,
      npcIds
    });
  }

}
