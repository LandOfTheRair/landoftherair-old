
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Dedlaen Spectre'
];

export class IncorporealUndeadSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 20,
      npcIds
    });
  }

}
