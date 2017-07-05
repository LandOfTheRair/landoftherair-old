
import { Spawner } from '../../../base/Spawner';

const npcIds = [
  'Rylt Deer',
  'Rylt Wolf',
  'Rylt Bear'
];

export class RyltForestMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 2,
      maxCreatures: 10,
      spawnRadius: 4,
      randomWalkRadius: 25,
      leashRadius: 35,
      npcIds
    });
  }

}
