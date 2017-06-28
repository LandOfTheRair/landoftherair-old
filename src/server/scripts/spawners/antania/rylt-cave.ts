
import { Spawner } from '../../../base/spawner';

const npcIds = [
  'Rylt Rockgolem',
  'Rylt Cave Apprentice'
];

export class RyltCaveMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 60,
      initialSpawn: 3,
      maxCreatures: 7,
      spawnRadius: 1,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

}
