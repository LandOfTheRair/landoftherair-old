
import { Spawner } from '../../../base/spawner';

const npcIds = [
  'Tutorial Deer',
  'Tutorial Wolf'
];

export class TutorialMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 4,
      maxCreatures: 6,
      spawnRadius: 1,
      randomWalkRadius: 5,
      leashRadius: 10,
      npcIds
    });
  }

}
