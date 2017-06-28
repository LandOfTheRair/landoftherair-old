
import { Spawner } from '../../../base/spawner';

const npcIds = [
  'Rylt Deer',
  'Rylt Wolf',
  'Rylt Bear'
];

export class RyltForestMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 1800,
      initialSpawn: 5,
      maxCreatures: 10,
      spawnRadius: 4,
      randomWalkRadius: 25,
      leashRadius: 35,
      npcIds
    });
  }

}
