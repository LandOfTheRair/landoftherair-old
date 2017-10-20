
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 1,  result: 'Rylt Deer' },
  { chance: 10, result: 'Rylt Wolf' },
  { chance: 8,  result: 'Rylt Bear' }
];

export class RyltForestMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 2,
      maxCreatures: 7,
      spawnRadius: 4,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

}
