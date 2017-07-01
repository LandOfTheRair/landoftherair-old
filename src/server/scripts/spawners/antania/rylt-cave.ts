
import { Spawner } from '../../../base/spawner';

const npcIds = [
  { chance: 2, result: 'Rylt Rockgolem' },
  { chance: 1, result: 'Rylt Cave Apprentice' }
];

export class RyltCaveMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 2,
      maxCreatures: 7,
      spawnRadius: 1,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

}
