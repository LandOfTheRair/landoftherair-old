
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Warg',
  'Tower Warspider'
];

export class TowerWarAnimalsSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 2,
      maxCreatures: 5,
      spawnRadius: 1,
      randomWalkRadius: 30,
      leashRadius: 40,
      npcIds
    });
  }

}
