
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Rylt Renegade Prisoner'
];

export class RyltPrisonMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 25,
      leashRadius: 35,
      npcIds
    });
  }

}
