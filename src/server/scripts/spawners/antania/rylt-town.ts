
import { Spawner } from '../../../base/spawner';

const npcIds = [
  'Rylt Guard',
  'Rylt Townee'
];

const paths = [
  '34-E 6-S 34-W 6-N',
  '6-S 34-E 6-N 34-W'
];

export class RyltTownMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 900,
      initialSpawn: 5,
      maxCreatures: 15,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 35,
      npcIds,
      paths
    });
  }

}
