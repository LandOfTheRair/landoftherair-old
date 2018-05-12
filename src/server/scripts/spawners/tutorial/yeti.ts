
import { Spawner } from '../../../base/Spawner';

const npcIds = [
  'Tutorial Yeti'
];

export class TutorialYetiSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 1,
      randomWalkRadius: 5,
      leashRadius: 10,
      npcIds
    });
  }

}
