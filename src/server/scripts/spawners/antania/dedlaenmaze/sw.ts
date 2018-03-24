
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 1,  result: 'Dedlaen Spectre' },
  { chance: 5,  result: 'Dedlaen Mummy' },
  { chance: 3,  result: 'Dedlaen Ghoul' }
];

export class SWSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 10,
      initialSpawn: 30,
      maxCreatures: 50,
      spawnRadius: 20,
      randomWalkRadius: 85,
      leashRadius: 105,
      npcIds
    });
  }

}
