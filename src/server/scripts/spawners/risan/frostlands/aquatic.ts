
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Frostlands Thermidor'
];

export class FrostlandsAquaticSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 2,
      spawnRadius: 1,
      randomWalkRadius: 25,
      leashRadius: 30,
      npcIds
    });
  }

}
