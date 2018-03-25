
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 1,  result: 'Dedlaen Spectre' },
  { chance: 5,  result: 'Dedlaen Mummy' },
  { chance: 3,  result: 'Dedlaen Ghoul' }
];

export class SWSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 5,
      initialSpawn: 5,
      maxCreatures: 45,
      spawnRadius: 15,
      randomWalkRadius: 35,
      leashRadius: 45,
      npcIds
    });
  }

}
