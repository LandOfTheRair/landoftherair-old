
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Heniz Townee'
];

const paths = [
  '18-W 8-N 1-NW 3-N 1-NE 5-N 2-E 3-S 2-W 2-S 1-SW 6-S 1-SE 6-S 18-E',
  '17-N 4-W 2-S 4-E 15-S',
  '1-SE 7-S 16-E 14-N 14-W 3-SW 3-S',
  '1-NE 3-N 2-NE 6-E 1-NE 2-N 1-NE 9-E 3-S 3-E 1-NE 2-N 8-E 1-SE 1-S 2-SW 5-W 3-S 6-SW 3-S 2-SW 18-W 8-N',
  '4-E 6-S 8-E 2-NE 5-N 2-NW 6-W 3-SW 3-W'
];

export class HenizTownSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 7,
      maxCreatures: 20,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 35,
      npcIds,
      paths
    });
  }

}
