
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Dedlaen Vampire Bat'
];

export class VampireBatSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 2,
      maxCreatures: 6,
      spawnRadius: 4,
      randomWalkRadius: 15,
      leashRadius: 20,
      npcIds
    });
  }

}
