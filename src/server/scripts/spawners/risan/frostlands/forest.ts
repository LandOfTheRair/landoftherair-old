
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Risan Crazed Deer',
  'Risan Crazed Wolf',
  'Risan Crazed Bear',
  'Risan Crazed Moose'
];

export class ForestSpawner extends Spawner {

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
