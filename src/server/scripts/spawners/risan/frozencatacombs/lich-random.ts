
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Catacombs Wight 5F',
  'Catacombs Ghost 5F',
  'Catacombs Qell 5F',
  'Catacombs Skeleton 5F',
  'Catacombs Mummy 5F',
  'Catacombs Spectre 5F',
  'Catacombs Nightwalker 5F'
];

export class LichRandomSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

}
