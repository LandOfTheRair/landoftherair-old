
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Mines Rockman'
];

export class RockmanSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 10,
      initialSpawn: 3,
      maxCreatures: 10,
      spawnRadius: 10,
      randomWalkRadius: 15,
      leashRadius: 20,
      npcIds
    });
  }

}
