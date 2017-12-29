
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Rylt Renegade Weak Rebel'
];

export class RyltPrisonWeakRebelSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 2,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

}
