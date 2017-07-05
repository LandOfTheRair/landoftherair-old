
import { Spawner } from '../../../base/Spawner';

const npcIds = [
  'Rylt Prison Guard'
];

export class RyltPrisonGuardSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 900,
      initialSpawn: 5,
      maxCreatures: 5,
      spawnRadius: 3,
      randomWalkRadius: 10,
      leashRadius: 15,
      npcIds
    });
  }

}
