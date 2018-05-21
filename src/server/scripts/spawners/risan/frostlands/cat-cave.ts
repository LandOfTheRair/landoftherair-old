
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Frostlands Sabretooth'
];

export class CatCaveSpawnerSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 7,
      initialSpawn: 3,
      maxCreatures: 5,
      spawnRadius: 5,
      randomWalkRadius: 7,
      leashRadius: 12,
      npcIds
    });
  }

}
