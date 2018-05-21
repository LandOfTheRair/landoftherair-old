
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 3, result: 'Frostlands Remorhaz' },
  { chance: 1, result: 'Frostlands Frostsnake' }
];

export class YetiExtraSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 4,
      randomWalkRadius: 6,
      leashRadius: 12,
      npcIds
    });
  }

}
