
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 3, result: 'Dedlaen Escort Townee' },
  { chance: 1, result: 'Dedlaen Escort Guard' }
];

export class DedlaenEscortSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 3600,
      initialSpawn: 5,
      maxCreatures: 5,
      spawnRadius: 2,
      randomWalkRadius: 10,
      leashRadius: 15,
      npcAISettings: ['dedlaenescort'],
      canSlowDown: false,
      doInitialSpawnImmediately: true,
      npcIds
    });
  }

}
