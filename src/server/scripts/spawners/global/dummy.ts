
import { Spawner } from '../../../base/Spawner';

const npcIds = [
  'Training Dummy'
];

export class TrainingDummySpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 1,
      initialSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 0,
      eliteTickCap: 0,
      npcAISettings: ['trainingdummy'],
      canSlowDown: false,
      npcIds
    });
  }

}
