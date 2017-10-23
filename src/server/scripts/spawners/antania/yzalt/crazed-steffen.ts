
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Crazed Steffen Warrior',
  'Crazed Steffen Healer'
];

export class CrazedSteffenSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 3,
      maxCreatures: 5,
      spawnRadius: 0,
      randomWalkRadius: 10,
      leashRadius: 35,
      npcIds
    });
  }

}
