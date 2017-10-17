
import { Spawner } from '../../../base/Spawner';

const npcIds = [
  'Rylt Deer'
];

export class RyltForestDeerSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 10,
      initialSpawn: 2,
      maxCreatures: 3,
      spawnRadius: 3,
      randomWalkRadius: 20,
      leashRadius: 25,
      npcIds
    });
  }

}
