
import { Spawner } from '../../../base/spawner';

const npcIds = [
  'Rylt Renegade'
];

export class RyltRenegadeMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 45,
      initialSpawn: 1,
      maxCreatures: 6,
      spawnRadius: 1,
      randomWalkRadius: 25,
      leashRadius: 35,
      npcIds
    });
  }

}
