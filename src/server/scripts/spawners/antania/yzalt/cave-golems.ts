
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Yzalt Rockgolem'
];

export class RockGolemSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 2,
      maxCreatures: 4,
      spawnRadius: 0,
      randomWalkRadius: 25,
      leashRadius: 45,
      npcIds
    });
  }

}
