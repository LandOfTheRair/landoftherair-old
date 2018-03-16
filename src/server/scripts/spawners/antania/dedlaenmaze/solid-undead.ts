
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Dedlaen Mummy'
];

export class SolidUndeadSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 3,
      maxCreatures: 7,
      spawnRadius: 0,
      randomWalkRadius: 45,
      leashRadius: 65,
      npcIds
    });
  }

}
