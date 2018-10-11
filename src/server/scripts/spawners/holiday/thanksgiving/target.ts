
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Thanksgiving Turkey Target'
];

export class ThanksgivingTargetSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 0,
      initialSpawn: 0,
      maxCreatures: 20,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 0,
      shouldBeActive: true,
      npcIds
    });
  }

}
