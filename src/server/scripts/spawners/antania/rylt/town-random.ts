
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Rylt Guard',
  'Rylt Townee'
];

export class RyltTownRandomSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 20,
      leashRadius: 35,
      npcIds
    });
  }

}
