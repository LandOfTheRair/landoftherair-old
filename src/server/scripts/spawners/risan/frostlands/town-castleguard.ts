
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Frostlands Guard'
];

const paths = [
  '5-N 5-S',
  '35-E 14-S 35-W 14-N',
  '14-S 35-E 14-N 35-W',
  '19-S 19-N'
];

export class FrostlandsTownCastleGuardSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 3,
      maxCreatures: 7,
      spawnRadius: 1,
      randomWalkRadius: 0,
      leashRadius: 40,
      npcIds,
      paths
    });
  }

}
