
import { Spawner } from '../../../base/spawner';

const npcIds = [
  'Rylt Renegade'
];

export class RyltRenegadeMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 60,
      initialSpawn: 3,
      maxCreatures: 7,
      spawnRadius: 1,
      randomWalkRadius: 25,
      leashRadius: 35,
      npcIds
    });
  }

}
