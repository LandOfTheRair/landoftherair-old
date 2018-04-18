
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Risan Crazed Dryad'
];

export class CrazedDryadSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 7,
      initialSpawn: 1,
      maxCreatures: 7,
      spawnRadius: 7,
      randomWalkRadius: 12,
      leashRadius: 18,
      npcIds
    });
  }

}
