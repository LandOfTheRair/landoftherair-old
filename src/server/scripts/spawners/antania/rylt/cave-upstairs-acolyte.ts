
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Crazed Saraxa Acolyte'
];

export class RyltCaveUpstairsAcolyteSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 0,
      initialSpawn: 0,
      maxCreatures: 1,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 0,
      shouldBeActive: true,
      npcIds
    });
  }

}
