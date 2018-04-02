
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Dedlaen Town Guard'
];

export class TownGuardSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 2,
      maxCreatures: 5,
      spawnRadius: 1,
      randomWalkRadius: 10,
      leashRadius: 15,
      npcIds
    });
  }

}
