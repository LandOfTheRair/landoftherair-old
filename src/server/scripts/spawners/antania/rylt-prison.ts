
import { Spawner } from '../../../base/spawner';

const npcIds = [
  'Rylt Renegade Prisoner'
];

export class RyltPrisonMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 40,
      initialSpawn: 3,
      maxCreatures: 5,
      spawnRadius: 0,
      randomWalkRadius: 25,
      leashRadius: 35,
      npcIds
    });
  }

}
