
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 10, result: 'Frostlands Brigand Fighter' },
  { chance: 10, result: 'Frostlands Brigand Mage' },
  { chance: 10, result: 'Frostlands Brigand Healer' },
  { chance: 3,  result: 'Frostlands Brigand Thief' },
  { chance: 1,  result: 'Frostlands Brigand Shieldbearer' },
  { chance: 1,  result: 'Frostlands Brigand Monk' }
];

export class BrigandCaveSpawnerSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 7,
      initialSpawn: 2,
      maxCreatures: 6,
      spawnRadius: 6,
      randomWalkRadius: 7,
      leashRadius: 12,
      npcIds
    });
  }

}
