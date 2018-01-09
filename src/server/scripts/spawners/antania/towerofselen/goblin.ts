
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Goblin',
  'Tower Goblin Thief'
];

export class TowerGoblinSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 2,
      maxCreatures: 5,
      spawnRadius: 1,
      randomWalkRadius: 30,
      leashRadius: 40,
      npcIds
    });
  }

}
