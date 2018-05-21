
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Frostlands Noble'
];

export class FrostlandsTownCastleNobleSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 1,
      maxCreatures: 2,
      spawnRadius: 1,
      randomWalkRadius: 7,
      leashRadius: 12,
      npcIds
    });
  }

}
