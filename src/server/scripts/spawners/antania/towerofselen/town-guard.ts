
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Town Guard'
];

export class TowerTownGuardSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 40,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 20,
      doInitialSpawnImmediately: true,
      npcIds
    });
  }

}
