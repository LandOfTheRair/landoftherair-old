
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Steffen LostChild'
];

export class SteffenLostChildSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 900,
      initialSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 0,
      randomWalkRadius: 50,
      leashRadius: 50,
      npcAISettings: ['steffenlostchild'],
      npcIds
    });
  }

}
