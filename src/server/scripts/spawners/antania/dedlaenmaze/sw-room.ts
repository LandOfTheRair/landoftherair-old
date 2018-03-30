
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 1,  result: 'Dedlaen Spectre' },
  { chance: 5,  result: 'Dedlaen Mummy' },
  { chance: 3,  result: 'Dedlaen Ghoul' }
];

export class SWRoomSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 2,
      maxCreatures: 10,
      spawnRadius: 2,
      randomWalkRadius: 7,
      leashRadius: 12,
      npcIds
    });
  }

}
