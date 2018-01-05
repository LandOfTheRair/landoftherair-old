
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Rylt Deer'
];

export class TowerForestDeerSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 10,
      initialSpawn: 2,
      maxCreatures: 3,
      spawnRadius: 1,
      randomWalkRadius: 40,
      leashRadius: 50,
      npcIds
    });
  }

}
