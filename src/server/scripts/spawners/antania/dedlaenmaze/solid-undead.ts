
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Dedlaen Mummy',
  'Dedlaen Ghoul'
];

export class SolidUndeadSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 45,
      leashRadius: 65,
      npcIds
    });
  }

}
