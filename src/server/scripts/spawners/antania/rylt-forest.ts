
import { Spawner } from '../../../base/Spawner';

const npcIds = [
  'Rylt Deer',
  'Rylt Wolf',
  'Rylt Bear'
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
