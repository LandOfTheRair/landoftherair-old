
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 5, result: 'Frostlands Remorhaz' },
  { chance: 5, result: 'Frostlands Frostsnake' },
  { chance: 1, result: 'Frostlands Sabretooth' }
];

export class FloesSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 7,
      initialSpawn: 2,
      maxCreatures: 6,
      spawnRadius: 7,
      randomWalkRadius: 12,
      leashRadius: 18,
      npcIds
    });
  }

}
