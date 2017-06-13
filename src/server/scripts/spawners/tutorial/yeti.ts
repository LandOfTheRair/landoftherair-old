
import { Spawner } from '../../../base/spawner';

const npcIds = [
  'Tutorial Yeti'
];

export class TutorialYetiSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 3600,
      initialSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 1,
      randomWalkRadius: 2,
      leashRadius: 5,
      npcIds
    });
  }

}
